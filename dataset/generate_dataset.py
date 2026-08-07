import json
import os
import random
import math

def generate_amazon_last_mile_dataset(output_path="dataset/amazon_last_mile_sample.json"):
    """
    Generates a realistic synthetic dataset modeled on the Amazon Last Mile Routing Research Challenge,
    adapted with Indian logistics context (Bengaluru region).
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Bengaluru Hub coordinates (Depot)
    hub_location = {
        "hub_id": "HUB_BLR_01",
        "name": "Bengaluru Fulfillment Center (Peenya)",
        "lat": 13.0285,
        "lng": 77.5197,
        "city": "Bengaluru",
        "state": "Karnataka",
        "operating_hours": {"start": "06:00", "end": "22:00"}
    }
    
    # Zones in Bengaluru with realistic lat/lng and traffic characteristics
    zones = [
        {"name": "Indiranagar", "lat": 12.9784, "lng": 77.6408, "traffic_factor": 1.4, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "Koramangala", "lat": 12.9352, "lng": 77.6245, "traffic_factor": 1.3, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "Whitefield", "lat": 12.9698, "lng": 77.7500, "traffic_factor": 1.5, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "Electronic City", "lat": 12.8399, "lng": 77.6770, "traffic_factor": 1.2, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "HSR Layout", "lat": 12.9121, "lng": 77.6445, "traffic_factor": 1.2, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "Hebbal", "lat": 13.0358, "lng": 77.5970, "traffic_factor": 1.35, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]},
        {"name": "Jayanagar", "lat": 12.9308, "lng": 77.5838, "traffic_factor": 1.1, "no_truck_hours": []},
        {"name": "Malleshwaram", "lat": 13.0031, "lng": 77.5643, "traffic_factor": 1.25, "no_truck_hours": ["08:00-11:00", "17:00-20:00"]}
    ]
    
    random.seed(42)
    stops = []
    packages = []
    
    stop_types = ["DELIVERY", "DELIVERY", "DELIVERY", "DELIVERY", "PICKUP"]
    
    for i in range(1, 41):
        zone = random.choice(zones)
        # Random offset around zone center (~1-5 km)
        lat = zone["lat"] + random.uniform(-0.025, 0.025)
        lng = zone["lng"] + random.uniform(-0.025, 0.025)
        
        st_type = random.choice(stop_types) if i > 5 else "DELIVERY"
        time_window_start = random.choice(["09:00", "10:00", "12:00", "14:00"])
        start_hour = int(time_window_start.split(":")[0])
        time_window_end = f"{start_hour + random.choice([2, 3, 4]):02d}:00"
        
        is_cod = random.random() < 0.35 # 35% COD orders in India
        cod_amount = round(random.uniform(250.0, 3500.0), 2) if is_cod else 0.0
        
        stop_id = f"STOP_{i:03d}"
        package_id = f"PKG_IN_{1000 + i}"
        weight_kg = round(random.uniform(0.5, 12.0), 2)
        volume_m3 = round(weight_kg * 0.008, 3)
        
        stops.append({
            "stop_id": stop_id,
            "sequence_order": i,
            "type": st_type,
            "zone_name": zone["name"],
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "address": f"Building #{random.randint(1, 150)}, 4th Cross, {zone['name']}, Bengaluru",
            "time_window": {"start": time_window_start, "end": time_window_end},
            "service_time_minutes": random.randint(5, 12),
            "is_cod": is_cod,
            "cod_amount_inr": cod_amount,
            "no_truck_zone": len(zone["no_truck_hours"]) > 0,
            "no_truck_hours": zone["no_truck_hours"],
            "package_id": package_id,
            "package_weight_kg": weight_kg,
            "package_volume_m3": volume_m3,
            "customer_name": f"Customer_{i}",
            "customer_phone": f"+91 98765 {i:05d}"
        })
        
        packages.append({
            "package_id": package_id,
            "stop_id": stop_id,
            "weight_kg": weight_kg,
            "volume_m3": volume_m3,
            "is_cod": is_cod,
            "cod_amount_inr": cod_amount,
            "dimensions_cm": {"length": 25, "width": 20, "height": 15}
        })
        
    # Generate fleet info
    vehicles = [
        {
            "vehicle_id": "VEH_BLR_01",
            "name": "Tata Ace EV #1",
            "driver_id": "DRV_001",
            "driver_name": "Ramesh Kumar",
            "type": "ELECTRIC_VAN",
            "max_capacity_kg": 250.0,
            "max_volume_m3": 2.5,
            "max_cod_limit_inr": 50000.0,
            "fuel_cost_per_km_inr": 3.5, # EV low cost
            "is_eco_friendly": True,
            "status": "IDLE"
        },
        {
            "vehicle_id": "VEH_BLR_02",
            "name": "Mahindra Bolero Pickup #2",
            "driver_id": "DRV_002",
            "driver_name": "Suresh Patel",
            "type": "DIESEL_PICKUP",
            "max_capacity_kg": 400.0,
            "max_volume_m3": 4.0,
            "max_cod_limit_inr": 75000.0,
            "fuel_cost_per_km_inr": 9.0,
            "is_eco_friendly": False,
            "status": "IDLE"
        },
        {
            "vehicle_id": "VEH_BLR_03",
            "name": "Three Wheeler EV #3",
            "driver_id": "DRV_003",
            "driver_name": "Anil Singh",
            "type": "THREE_WHEELER_EV",
            "max_capacity_kg": 150.0,
            "max_volume_m3": 1.5,
            "max_cod_limit_inr": 30000.0,
            "fuel_cost_per_km_inr": 2.5,
            "is_eco_friendly": True,
            "status": "IDLE"
        }
    ]
    
    dataset = {
        "dataset_name": "Amazon Last Mile Routing Challenge - Indian Supply Chain Edition",
        "region": "Bengaluru Metropolitan Region",
        "currency": "INR",
        "hub": hub_location,
        "vehicles": vehicles,
        "stops": stops,
        "packages": packages
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"Generated dataset with {len(stops)} stops and {len(vehicles)} vehicles at {output_path}")
    return dataset

if __name__ == "__main__":
    generate_amazon_last_mile_dataset("dataset/amazon_last_mile_sample.json")
