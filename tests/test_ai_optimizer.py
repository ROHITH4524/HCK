import pytest
import os
import json
from app.services.data_loader import load_amazon_dataset, haversine_distance_km
from app.ai.constraint_engine import ConstraintEngine

def test_haversine_distance():
    # Distance between Bengaluru Hub (13.0285, 77.5197) and Indiranagar (12.9784, 77.6408)
    dist = haversine_distance_km(13.0285, 77.5197, 12.9784, 77.6408)
    assert dist > 10.0 and dist < 20.0

def test_constraint_engine():
    engine = ConstraintEngine(max_cod_limit=50000.0)
    
    vehicle = {"name": "Tata Ace EV", "max_capacity_kg": 200.0, "max_cod_limit_inr": 50000.0}
    stops_valid = [{"package_weight_kg": 150.0, "is_cod": True, "cod_amount_inr": 30000.0}]
    stops_invalid_cod = [{"package_weight_kg": 50.0, "is_cod": True, "cod_amount_inr": 60000.0}]

    ok_cod, _ = engine.validate_cod_limit(vehicle, stops_valid)
    assert ok_cod is True

    bad_cod, _ = engine.validate_cod_limit(vehicle, stops_invalid_cod)
    assert bad_cod is False
