import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.services.data_loader import seed_database_if_empty

# Ensure database tables and seed data exist prior to test suite execution
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    seed_database_if_empty(db)
finally:
    db.close()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_vehicles_endpoint():
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    vehicles = response.json()
    assert isinstance(vehicles, list)
    assert len(vehicles) > 0

def test_benchmark_endpoint():
    response = client.get("/api/v1/benchmark")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    assert any(b["algorithm"] == "RouteMind AI (Our Solution)" for b in data)
