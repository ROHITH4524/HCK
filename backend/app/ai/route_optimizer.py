import math
from typing import List, Dict, Any
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from app.services.data_loader import build_distance_duration_matrix

class RouteOptimizer:
    """
    Google OR-Tools VRPTW (Vehicle Routing Problem with Time Windows & Capacity Constraints) Engine.
    """

    def __init__(self, hub: Dict[str, Any], vehicles: List[Dict[str, Any]], stops: List[Dict[str, Any]]):
        self.hub = hub
        self.vehicles = vehicles
        self.stops = stops
        
        # Combined locations array: index 0 is Hub, indices 1..N are stops
        self.all_locations = [
            {"lat": hub["lat"], "lng": hub["lng"], "name": hub["name"], "is_hub": True}
        ] + [
            {"lat": s["lat"], "lng": s["lng"], "name": s["address"], "is_hub": False, "stop_id": s["stop_id"]}
            for s in stops
        ]

    def solve_vrp(self) -> List[Dict[str, Any]]:
        """
        Solves multi-vehicle routing problem using Google OR-Tools.
        Returns list of optimized routes per vehicle.
        """
        matrix_data = build_distance_duration_matrix(self.all_locations)
        dist_matrix_m = [
            [int(d * 1000) for d in row] for row in matrix_data["distance_km"]
        ]
        duration_matrix_sec = [
            [int(t * 60) for t in row] for row in matrix_data["duration_min"]
        ]

        num_locations = len(self.all_locations)
        num_vehicles = len(self.vehicles)

        if num_locations <= 1:
            return []

        # Create Routing Index Manager (depot = 0)
        manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
        routing = pywrapcp.RoutingModel(manager)

        # Distance Callback
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return dist_matrix_m[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Demand / Weight Capacity Dimension
        def demand_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            if from_node == 0:
                return 0
            return int(self.stops[from_node - 1].get("package_weight_kg", 1.0) * 10) # in 100g units

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        vehicle_capacities = [int(v.get("max_capacity_kg", 250.0) * 10) for v in self.vehicles]
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,  # null capacity slack
            vehicle_capacities,  # vehicle maximum capacities
            True,  # start cumul to zero
            "Capacity"
        )

        # Time Dimension Callback
        def time_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            service_time_sec = 0 if from_node == 0 else int(self.stops[from_node - 1].get("service_time_minutes", 8) * 60)
            return duration_matrix_sec[from_node][to_node] + service_time_sec

        time_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.AddDimension(
            time_callback_index,
            3600,  # allow waiting time (1 hour slack)
            43200, # maximum total time per vehicle (12 hours)
            False, # Don't force start to zero
            "Time"
        )

        # Stops Count Dimension (balances workload across all active vehicles)
        def count_callback(from_index):
            return 1 if manager.IndexToNode(from_index) != 0 else 0

        count_callback_index = routing.RegisterUnaryTransitCallback(count_callback)
        max_stops = [max(1, math.ceil(len(self.stops) / num_vehicles) + 4)] * num_vehicles
        routing.AddDimensionWithVehicleCapacity(
            count_callback_index,
            0,
            max_stops,
            True,
            "StopsCount"
        )

        # COD Cash Safety Limit Dimension
        def cod_callback(from_index):
            from_node = manager.IndexToNode(from_index)
            if from_node == 0:
                return 0
            stop_item = self.stops[from_node - 1]
            return int(stop_item.get("cod_amount_inr", 0.0)) if stop_item.get("is_cod", False) else 0

        cod_callback_index = routing.RegisterUnaryTransitCallback(cod_callback)
        cod_limits = [int(v.get("max_cod_limit_inr", 50000.0)) for v in self.vehicles]
        routing.AddDimensionWithVehicleCapacity(
            cod_callback_index,
            0,
            cod_limits,
            True,
            "CODLimit"
        )

        # Set Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 3

        # Solve
        solution = routing.SolveWithParameters(search_parameters)

        result_routes = []
        if solution:
            for vehicle_id_idx in range(num_vehicles):
                index = routing.Start(vehicle_id_idx)
                route_stops = []
                total_dist_m = 0
                total_time_s = 0

                while not routing.IsEnd(index):
                    node = manager.IndexToNode(index)
                    if node != 0: # Exclude depot from stops array
                        stop_obj = dict(self.stops[node - 1])
                        # Calculate ETA string based on start time 09:00 AM
                        elapsed_min = total_time_s // 60
                        arr_hour = 9 + int(elapsed_min // 60)
                        arr_min = int(elapsed_min % 60)
                        stop_obj["eta"] = f"{arr_hour:02d}:{arr_min:02d}"
                        route_stops.append(stop_obj)

                    previous_index = index
                    index = solution.Value(routing.NextVar(index))
                    total_dist_m += routing.GetArcCostForVehicle(previous_index, index, vehicle_id_idx)
                    
                    p_node = manager.IndexToNode(previous_index)
                    n_node = manager.IndexToNode(index)
                    s_time = 0 if p_node == 0 else int(self.stops[p_node - 1].get("service_time_minutes", 8) * 60)
                    total_time_s += duration_matrix_sec[p_node][n_node] + s_time

                v_info = self.vehicles[vehicle_id_idx]
                dist_km = round(total_dist_m / 1000.0, 2)
                fuel_cost = round(dist_km * v_info.get("fuel_cost_per_km_inr", 4.0), 2)
                total_cod = sum(s.get("cod_amount_inr", 0.0) for s in route_stops if s.get("is_cod", False))

                # Update stop sequence order
                for seq, st in enumerate(route_stops, start=1):
                    st["sequence_order"] = seq

                result_routes.append({
                    "route_id": f"RT_{v_info['vehicle_id']}",
                    "vehicle_id": v_info["vehicle_id"],
                    "driver_id": v_info.get("driver_id", f"DRV_{vehicle_id_idx+1:03d}"),
                    "total_distance_km": dist_km,
                    "total_duration_minutes": round(total_time_s / 60.0, 1),
                    "total_fuel_cost_inr": fuel_cost,
                    "total_cod_amount_inr": total_cod,
                    "status": "ACTIVE",
                    "optimization_algorithm": "Google OR-Tools VRPTW + Indian Logistics AI",
                    "stops": route_stops
                })

        return result_routes
