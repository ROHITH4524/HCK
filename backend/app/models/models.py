from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="SUPERVISOR") # ADMIN, SUPERVISOR, DRIVER
    is_active = Column(Boolean, default=True)

class Hub(Base):
    __tablename__ = "hubs"

    id = Column(Integer, primary_key=True, index=True)
    hub_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    operating_hours = Column(JSON, nullable=True)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    driver_id = Column(String, nullable=True)
    type = Column(String, default="VAN") # ELECTRIC_VAN, DIESEL_PICKUP, THREE_WHEELER_EV
    max_capacity_kg = Column(Float, default=250.0)
    max_volume_m3 = Column(Float, default=2.5)
    max_cod_limit_inr = Column(Float, default=50000.0)
    fuel_cost_per_km_inr = Column(Float, default=4.0)
    is_eco_friendly = Column(Boolean, default=True)
    status = Column(String, default="IDLE") # IDLE, EN_ROUTE, MAINTENANCE
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    collected_cod_inr = Column(Float, default=0.0)

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    vehicle_id = Column(String, nullable=True)
    status = Column(String, default="AVAILABLE") # AVAILABLE, ON_DUTY, OFF_DUTY

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(String, unique=True, index=True, nullable=False)
    vehicle_id = Column(String, nullable=False)
    driver_id = Column(String, nullable=False)
    total_distance_km = Column(Float, default=0.0)
    total_duration_minutes = Column(Float, default=0.0)
    total_fuel_cost_inr = Column(Float, default=0.0)
    total_cod_amount_inr = Column(Float, default=0.0)
    status = Column(String, default="PLANNED") # PLANNED, ACTIVE, COMPLETED, REPLANNED
    optimization_algorithm = Column(String, default="RouteMind_OR_Tools_AI")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stops = relationship("Stop", back_populates="route", primaryjoin="Route.route_id == Stop.route_id", cascade="all, delete-orphan")

class Stop(Base):
    __tablename__ = "stops"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(String, unique=True, index=True, nullable=False)
    route_id = Column(String, ForeignKey("routes.route_id"), nullable=True)
    sequence_order = Column(Integer, nullable=False)
    type = Column(String, default="DELIVERY") # DELIVERY, PICKUP
    zone_name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    time_window_start = Column(String, default="09:00")
    time_window_end = Column(String, default="18:00")
    service_time_minutes = Column(Integer, default=8)
    is_cod = Column(Boolean, default=False)
    cod_amount_inr = Column(Float, default=0.0)
    no_truck_zone = Column(Boolean, default=False)
    package_id = Column(String, nullable=False)
    package_weight_kg = Column(Float, default=1.0)
    package_volume_m3 = Column(Float, default=0.01)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, DELIVERED, FAILED
    eta = Column(String, nullable=True)

    route = relationship("Route", back_populates="stops", primaryjoin="Stop.route_id == Route.route_id")

class LiveEvent(Base):
    __tablename__ = "live_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    event_type = Column(String, nullable=False) # TRAFFIC_JAM, FAILED_DELIVERY, INSTANT_PICKUP, VEHICLE_BREAKDOWN
    stop_id = Column(String, nullable=True)
    vehicle_id = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String, default="UNRESOLVED") # UNRESOLVED, REPLANNED, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow)

class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(String, unique=True, index=True, nullable=False)
    event_id = Column(String, nullable=False)
    route_id = Column(String, nullable=False)
    before_distance_km = Column(Float, nullable=False)
    after_distance_km = Column(Float, nullable=False)
    before_duration_min = Column(Float, nullable=False)
    after_duration_min = Column(Float, nullable=False)
    time_saved_min = Column(Float, nullable=False)
    distance_saved_km = Column(Float, nullable=False)
    cost_diff_inr = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    affected_constraints = Column(JSON, nullable=True)
    old_sequence = Column(JSON, nullable=False)
    new_sequence = Column(JSON, nullable=False)
    status = Column(String, default="PENDING_APPROVAL") # PENDING_APPROVAL, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

class SupervisorApproval(Base):
    __tablename__ = "supervisor_approvals"

    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(String, unique=True, index=True, nullable=False)
    decision_id = Column(String, ForeignKey("ai_decisions.decision_id"), nullable=False)
    supervisor_id = Column(String, nullable=False)
    status = Column(String, nullable=False) # APPROVED, REJECTED
    notes = Column(Text, nullable=True)
    responded_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_role = Column(String, default="SUPERVISOR") # SUPERVISOR, DRIVER, ALL
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
