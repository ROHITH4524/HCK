from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Vehicle
from app.schemas.schemas import VehicleSchema

router = APIRouter(prefix="/vehicles", tags=["Vehicles & Fleet"])

@router.get("", response_model=List[VehicleSchema])
def get_vehicles(db: Session = Depends(get_db)):
    """Fetches all fleet vehicles with live location and status."""
    return db.query(Vehicle).all()

@router.get("/{vehicle_id}", response_model=VehicleSchema)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.post("/{vehicle_id}/location")
def update_vehicle_location(vehicle_id: str, lat: float, lng: float, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    v.current_lat = lat
    v.current_lng = lng
    db.commit()
    return {"status": "success", "vehicle_id": vehicle_id, "lat": lat, "lng": lng}
