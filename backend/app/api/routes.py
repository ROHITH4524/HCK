from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import uuid

from app.core.database import get_db
from app.models.models import Route, Stop, Vehicle, Hub, LiveEvent, AIDecision, Notification
from app.schemas.schemas import RouteOptimizeRequest, RouteResponse, ReplanRequest, AIDecisionResponse
from app.services.data_loader import load_amazon_dataset
from app.ai.route_optimizer import RouteOptimizer
from app.ai.dynamic_replanner import DynamicReplanner
from app.ai.explainability import ExplainabilityEngine
from app.api.websockets import broadcast_websocket_event

router = APIRouter(prefix="", tags=["Route Optimization & Replanning"])

@router.post("/optimize-route", response_model=List[RouteResponse])
async def optimize_route(req: RouteOptimizeRequest, db: Session = Depends(get_db)):
    """
    Executes Google OR-Tools Vehicle Routing Problem solver with Indian logistics constraints.
    """
    dataset = load_amazon_dataset()
    hub = dataset["hub"]
    vehicles = dataset["vehicles"]
    stops = dataset["stops"]

    # Clear existing routes and stops for clean state
    db.query(Stop).delete()
    db.query(Route).delete()
    db.commit()

    # Filter requested vehicles if specified
    if req.vehicle_ids:
        vehicles = [v for v in vehicles if v["vehicle_id"] in req.vehicle_ids]

    optimizer = RouteOptimizer(hub, vehicles, stops)
    optimized_routes = optimizer.solve_vrp()

    db_routes = []
    for r_data in optimized_routes:
        route_obj = Route(
            route_id=r_data["route_id"],
            vehicle_id=r_data["vehicle_id"],
            driver_id=r_data["driver_id"],
            total_distance_km=r_data["total_distance_km"],
            total_duration_minutes=r_data["total_duration_minutes"],
            total_fuel_cost_inr=r_data["total_fuel_cost_inr"],
            total_cod_amount_inr=r_data["total_cod_amount_inr"],
            status="ACTIVE",
            optimization_algorithm=r_data["optimization_algorithm"]
        )
        db.add(route_obj)
        db.commit()

        # Update vehicle position to depot & status to EN_ROUTE
        veh = db.query(Vehicle).filter(Vehicle.vehicle_id == r_data["vehicle_id"]).first()
        if veh:
            veh.status = "EN_ROUTE"
            veh.collected_cod_inr = 0.0

        for st in r_data["stops"]:
            stop_obj = Stop(
                stop_id=st["stop_id"],
                route_id=r_data["route_id"],
                sequence_order=st["sequence_order"],
                type=st.get("type", "DELIVERY"),
                zone_name=st["zone_name"],
                lat=st["lat"],
                lng=st["lng"],
                address=st["address"],
                time_window_start=st["time_window"]["start"],
                time_window_end=st["time_window"]["end"],
                service_time_minutes=st["service_time_minutes"],
                is_cod=st["is_cod"],
                cod_amount_inr=st["cod_amount_inr"],
                no_truck_zone=st["no_truck_zone"],
                package_id=st["package_id"],
                package_weight_kg=st["package_weight_kg"],
                package_volume_m3=st["package_volume_m3"],
                customer_name=st["customer_name"],
                customer_phone=st["customer_phone"],
                status="PENDING",
                eta=st.get("eta", "10:30")
            )
            db.add(stop_obj)
        
        db.commit()
        db_routes.append(route_obj)

    # Broadcast real-time websocket update
    await broadcast_websocket_event("ROUTE_OPTIMIZED", {"routes_count": len(db_routes)})
    return db_routes

@router.get("/routes", response_model=List[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    """Fetches all active routes with ordered delivery stops."""
    routes = db.query(Route).all()
    return routes

@router.get("/routes/{route_id}", response_model=RouteResponse)
def get_route_by_id(route_id: str, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.route_id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.post("/replan", response_model=AIDecisionResponse)
async def trigger_replan(req: ReplanRequest, db: Session = Depends(get_db)):
    """
    Sub-30s Dynamic Replanning API triggered by traffic, instant pickups, failed delivery, or breakdown.
    Generates an AI decision record for Supervisor Approval.
    """
    route = db.query(Route).filter(Route.route_id == req.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    # Serialize SQLAlchemy route object to dictionary for AI engine
    route_dict = {
        "route_id": route.route_id,
        "vehicle_id": route.vehicle_id,
        "driver_id": route.driver_id,
        "total_distance_km": route.total_distance_km,
        "total_duration_minutes": route.total_duration_minutes,
        "total_fuel_cost_inr": route.total_fuel_cost_inr,
        "stops": [
            {
                "stop_id": s.stop_id,
                "sequence_order": s.sequence_order,
                "type": s.type,
                "zone_name": s.zone_name,
                "lat": s.lat,
                "lng": s.lng,
                "address": s.address,
                "service_time_minutes": s.service_time_minutes,
                "is_cod": s.is_cod,
                "cod_amount_inr": s.cod_amount_inr,
                "package_id": s.package_id,
                "package_weight_kg": s.package_weight_kg,
                "status": s.status
            }
            for s in route.stops
        ]
    }

    replanner = DynamicReplanner()
    
    if req.event_type == "TRAFFIC_JAM":
        replan_res = replanner.replan_traffic_jam(route_dict, req.affected_stop_id or "STOP_005")
    elif req.event_type == "INSTANT_PICKUP":
        new_st = req.new_pickup or {
            "stop_id": f"PICKUP_{uuid.uuid4().hex[:6]}",
            "sequence_order": 99,
            "type": "PICKUP",
            "zone_name": "Koramangala",
            "lat": 12.9360,
            "lng": 77.6250,
            "address": "Express Pickup, Koramangala 5th Block",
            "service_time_minutes": 5,
            "is_cod": False,
            "cod_amount_inr": 0.0,
            "package_id": f"PKG_PICKUP_{uuid.uuid4().hex[:4]}",
            "package_weight_kg": 2.5,
            "status": "PENDING"
        }
        replan_res = replanner.replan_instant_pickup(route_dict, new_st)
    elif req.event_type == "FAILED_DELIVERY":
        replan_res = replanner.replan_failed_delivery(route_dict, req.affected_stop_id or "STOP_003")
    elif req.event_type == "ORDER_CANCELLED":
        replan_res = replanner.replan_order_cancelled(route_dict, req.affected_stop_id or "STOP_004")
    elif req.event_type == "ORDER_POSTPONED":
        replan_res = replanner.replan_order_postponed(route_dict, req.affected_stop_id or "STOP_004")
    else:
        replan_res = replanner.replan_traffic_jam(route_dict, req.affected_stop_id or "STOP_002")

    # Generate Explainability narrative
    explainer = ExplainabilityEngine()
    exp = explainer.generate_replan_explanation(replan_res, req.event_type)

    event_id = f"EVT_{uuid.uuid4().hex[:6]}"
    decision_id = f"DEC_{uuid.uuid4().hex[:6]}"

    # Save Live Event
    event_obj = LiveEvent(
        event_id=event_id,
        event_type=req.event_type,
        stop_id=req.affected_stop_id,
        vehicle_id=route.vehicle_id,
        description=req.description,
        status="REPLANNED"
    )
    db.add(event_obj)

    # Old and new sequence stop IDs
    old_seq = [s["stop_id"] for s in route_dict["stops"]]
    new_seq = [s["stop_id"] for s in replan_res["new_route"]["stops"]]

    ai_decision = AIDecision(
        decision_id=decision_id,
        event_id=event_id,
        route_id=route.route_id,
        before_distance_km=replan_res["before_distance_km"],
        after_distance_km=replan_res["after_distance_km"],
        before_duration_min=replan_res["before_duration_min"],
        after_duration_min=replan_res["after_duration_min"],
        time_saved_min=replan_res["time_saved_min"],
        distance_saved_km=replan_res["distance_saved_km"],
        cost_diff_inr=replan_res["cost_diff_inr"],
        explanation=exp["narrative"],
        affected_constraints=exp["affected_constraints"],
        old_sequence=old_seq,
        new_sequence=new_seq,
        status="PENDING_APPROVAL"
    )
    db.add(ai_decision)

    # Save Supervisor Notification
    notif = Notification(
        recipient_role="SUPERVISOR",
        title=f"AI Route Replan Pending: {req.event_type}",
        message=f"{exp['headline']} Approval required."
    )
    db.add(notif)
    db.commit()

    # Broadcast live event to frontend map & supervisor dashboard
    await broadcast_websocket_event("REPLAN_GENERATED", {
        "decision_id": decision_id,
        "event_type": req.event_type,
        "headline": exp["headline"]
    })

    return ai_decision

@router.get("/history", response_model=List[AIDecisionResponse])
def get_decision_history(db: Session = Depends(get_db)):
    """Fetches full AI Decision audit log."""
    decisions = db.query(AIDecision).order_by(AIDecision.created_at.desc()).all()
    return decisions
