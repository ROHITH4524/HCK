from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: str = "SUPERVISOR"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool

# Stop & Package Schemas
class StopSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stop_id: str
    sequence_order: int
    type: str = "DELIVERY"
    zone_name: str
    lat: float
    lng: float
    address: str
    time_window_start: str = "09:00"
    time_window_end: str = "18:00"
    service_time_minutes: int = 8
    is_cod: bool = False
    cod_amount_inr: float = 0.0
    no_truck_zone: bool = False
    package_id: str
    package_weight_kg: float
    package_volume_m3: float
    customer_name: str
    customer_phone: str
    status: str = "PENDING"
    eta: Optional[str] = None

# Vehicle Schema
class VehicleSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_id: str
    name: str
    driver_id: Optional[str] = None
    type: str
    max_capacity_kg: float
    max_volume_m3: float
    max_cod_limit_inr: float
    fuel_cost_per_km_inr: float
    is_eco_friendly: bool
    status: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    collected_cod_inr: float = 0.0

# Route Schemas
class RouteOptimizeRequest(BaseModel):
    vehicle_ids: Optional[List[str]] = None
    enforce_indian_constraints: bool = True
    consider_traffic: bool = True

class RouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    route_id: str
    vehicle_id: str
    driver_id: str
    total_distance_km: float
    total_duration_minutes: float
    total_fuel_cost_inr: float
    total_cod_amount_inr: float
    status: str
    optimization_algorithm: str
    stops: List[StopSchema]
    created_at: datetime

# Live Event & Replanning Schemas
class ReplanRequest(BaseModel):
    event_type: str # TRAFFIC_JAM, FAILED_DELIVERY, INSTANT_PICKUP, VEHICLE_BREAKDOWN
    route_id: str
    affected_stop_id: Optional[str] = None
    new_pickup: Optional[Dict[str, Any]] = None # Custom stop if instant pickup
    vehicle_id: Optional[str] = None
    description: str

class AIDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    decision_id: str
    event_id: str
    route_id: str
    before_distance_km: float
    after_distance_km: float
    before_duration_min: float
    after_duration_min: float
    time_saved_min: float
    distance_saved_km: float
    cost_diff_inr: float
    explanation: str
    affected_constraints: List[str]
    old_sequence: List[str]
    new_sequence: List[str]
    status: str
    created_at: datetime

class SupervisorApprovalRequest(BaseModel):
    decision_id: str
    approve: bool
    notes: Optional[str] = None

# Analytics Schemas
class DashboardKPI(BaseModel):
    total_routes_today: int
    active_vehicles: int
    fuel_saved_inr: float
    co2_reduced_kg: float
    avg_eta_accuracy_percent: float
    delayed_deliveries: int
    replanned_routes_today: int
    success_rate_percent: float
    total_cod_collected_inr: float

class BenchmarkResult(BaseModel):
    algorithm: str
    total_distance_km: float
    total_time_min: float
    fuel_cost_inr: float
    delivery_success_rate: float
    eta_accuracy_percent: float
    savings_vs_greedy_percent: float
