import json
import math
import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Hub, Vehicle, Driver, Stop, Route, User
from app.core.security import get_password_hash
from app.core.config import settings

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Great-Circle distance between two points in km using Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def load_amazon_dataset(filepath: str = settings.DATASET_PATH) -> Dict[str, Any]:
    """Loads raw dataset JSON."""
    if not os.path.exists(filepath):
        candidates = [
            filepath,
            os.path.join("..", filepath),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset", "amazon_last_mile_sample.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "amazon_last_mile_sample.json")),
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                filepath = candidate
                break

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def build_distance_duration_matrix(locations: List[Dict[str, float]], speed_kmh: float = 28.0) -> Dict[str, Any]:
    """
    Builds distance (meters/km) and duration (seconds/minutes) 2D matrices between all location points.
    locations is a list of dicts with 'lat' and 'lng'.
    """
    n = len(locations)
    distance_matrix_km = [[0.0] * n for _ in range(n)]
    duration_matrix_min = [[0.0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                dist = haversine_distance_km(
                    locations[i]['lat'], locations[i]['lng'],
                    locations[j]['lat'], locations[j]['lng']
                )
                # Apply 1.25 road curvature factor for real urban roads
                road_dist = dist * 1.25
                # Travel duration in minutes
                travel_min = (road_dist / speed_kmh) * 60.0
                
                distance_matrix_km[i][j] = round(road_dist, 3)
                duration_matrix_min[i][j] = round(travel_min, 2)
                
    return {
        "distance_km": distance_matrix_km,
        "duration_min": duration_matrix_min
    }

def seed_database_if_empty(db: Session):
    """Populates database with initial seed data from Amazon Last Mile dataset."""
    # Check if users exist
    if not db.query(User).first():
        admin = User(
            username="admin",
            email="admin@routemind.ai",
            full_name="Operations Manager",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN"
        )
        supervisor = User(
            username="supervisor",
            email="supervisor@routemind.ai",
            full_name="Fleet Supervisor Peenya",
            hashed_password=get_password_hash("supervisor123"),
            role="SUPERVISOR"
        )
        driver = User(
            username="driver1",
            email="driver1@routemind.ai",
            full_name="Ramesh Kumar",
            hashed_password=get_password_hash("driver123"),
            role="DRIVER"
        )
        db.add_all([admin, supervisor, driver])
        db.commit()

    # Check if hub exists
    if not db.query(Hub).first():
        dataset = load_amazon_dataset()
        hub_data = dataset["hub"]
        hub = Hub(
            hub_id=hub_data["hub_id"],
            name=hub_data["name"],
            lat=hub_data["lat"],
            lng=hub_data["lng"],
            city=hub_data["city"],
            state=hub_data["state"],
            operating_hours=hub_data["operating_hours"]
        )
        db.add(hub)
        
        # Vehicles
        for v in dataset["vehicles"]:
            vehicle = Vehicle(
                vehicle_id=v["vehicle_id"],
                name=v["name"],
                driver_id=v["driver_id"],
                type=v["type"],
                max_capacity_kg=v["max_capacity_kg"],
                max_volume_m3=v["max_volume_m3"],
                max_cod_limit_inr=v["max_cod_limit_inr"],
                fuel_cost_per_km_inr=v["fuel_cost_per_km_inr"],
                is_eco_friendly=v["is_eco_friendly"],
                status=v["status"],
                current_lat=hub_data["lat"],
                current_lng=hub_data["lng"]
            )
            db.add(vehicle)
            
            driver = Driver(
                driver_id=v["driver_id"],
                name=v["driver_name"],
                phone="+91 98765 00001",
                vehicle_id=v["vehicle_id"],
                status="AVAILABLE"
            )
            db.add(driver)
            
        db.commit()

    # Check if routes exist, seed from dataset using RouteOptimizer if empty
    if not db.query(Route).first():
        dataset = load_amazon_dataset()
        hub = dataset["hub"]
        vehicles = dataset["vehicles"]
        stops = dataset["stops"]

        from app.ai.route_optimizer import RouteOptimizer
        optimizer = RouteOptimizer(hub, vehicles, stops)
        optimized_routes = optimizer.solve_vrp()

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

            veh = db.query(Vehicle).filter(Vehicle.vehicle_id == r_data["vehicle_id"]).first()
            if veh:
                veh.status = "EN_ROUTE"

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
