from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.models import AIDecision, Route, Stop, SupervisorApproval, Notification
from app.schemas.schemas import SupervisorApprovalRequest, AIDecisionResponse
from app.api.websockets import broadcast_websocket_event

router = APIRouter(prefix="", tags=["Supervisor Review & Approval"])

@router.get("/pending-approvals", response_model=List[AIDecisionResponse])
def get_pending_approvals(db: Session = Depends(get_db)):
    """Fetches AI dynamic replan proposals awaiting Fleet Supervisor review."""
    return db.query(AIDecision).filter(AIDecision.status == "PENDING_APPROVAL").all()

@router.post("/approve")
async def approve_ai_decision(req: SupervisorApprovalRequest, db: Session = Depends(get_db)):
    """
    Approve or Reject an AI Dynamic Replan decision.
    If approved, mutates active route stops to match new sequence and updates driver navigation.
    """
    decision = db.query(AIDecision).filter(AIDecision.decision_id == req.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="AI Decision not found")

    approval_id = f"APP_{uuid.uuid4().hex[:6]}"
    status_str = "APPROVED" if req.approve else "REJECTED"

    approval = SupervisorApproval(
        approval_id=approval_id,
        decision_id=decision.decision_id,
        supervisor_id="supervisor_01",
        status=status_str,
        notes=req.notes or ("Supervisor approved AI route modification" if req.approve else "Rejected by supervisor"),
        responded_at=datetime.utcnow()
    )
    db.add(approval)
    decision.status = status_str

    if req.approve:
        route = db.query(Route).filter(Route.route_id == decision.route_id).first()
        if route:
            # Update metrics
            route.total_distance_km = decision.after_distance_km
            route.total_duration_minutes = decision.after_duration_min
            route.total_fuel_cost_inr = round(decision.after_distance_km * 4.0, 2)
            route.status = "REPLANNED"

            # Re-sequence stops based on decision.new_sequence list
            stops_dict = {s.stop_id: s for s in route.stops}
            for idx, stop_id in enumerate(decision.new_sequence, start=1):
                if stop_id in stops_dict:
                    stops_dict[stop_id].sequence_order = idx

    # Send Notification to Driver
    notif = Notification(
        recipient_role="DRIVER",
        title=f"Route Update {status_str}",
        message=f"Supervisor has {status_str.lower()} your route adjustment. Follow updated sequence."
    )
    db.add(notif)
    db.commit()

    # Broadcast WebSocket update to Driver & Supervisor screens
    await broadcast_websocket_event("DECISION_APPROVED" if req.approve else "DECISION_REJECTED", {
        "decision_id": decision.decision_id,
        "route_id": decision.route_id,
        "status": status_str
    })

    return {
        "status": "success",
        "decision_id": decision.decision_id,
        "approval_status": status_str,
        "message": f"Decision {status_str.lower()} successfully."
    }
