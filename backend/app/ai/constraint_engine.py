from typing import List, Dict, Any, Tuple
from datetime import datetime, time

class ConstraintEngine:
    """
    Indian Logistics Constraint Validation & Enforcer Engine.
    Handles hyper-local constraints specific to Indian urban supply chains.
    """

    def __init__(self, max_cod_limit: float = 75000.0, max_driving_hours: float = 9.0):
        self.max_cod_limit = max_cod_limit
        self.max_driving_hours = max_driving_hours

    def validate_vehicle_capacity(self, vehicle: Dict[str, Any], stops: List[Dict[str, Any]]) -> Tuple[bool, str]:
        """Checks total weight and volume against vehicle capacities."""
        total_weight = sum(s.get("package_weight_kg", 1.0) for s in stops)
        total_volume = sum(s.get("package_volume_m3", 0.01) for s in stops)

        max_weight = vehicle.get("max_capacity_kg", 250.0)
        max_vol = vehicle.get("max_volume_m3", 2.5)

        if total_weight > max_weight:
            return False, f"Capacity Exceeded: Total weight {total_weight:.1f}kg > Max {max_weight}kg for {vehicle.get('name')}"
        if total_volume > max_vol:
            return False, f"Volume Exceeded: Total volume {total_volume:.2f}m³ > Max {max_vol}m³ for {vehicle.get('name')}"

        return True, "Capacity Valid"

    def validate_cod_limit(self, vehicle: Dict[str, Any], stops: List[Dict[str, Any]]) -> Tuple[bool, str]:
        """Validates cumulative Cash-on-Delivery (COD) cash carried against vehicle/driver safety limit."""
        total_cod = sum(s.get("cod_amount_inr", 0.0) for s in stops if s.get("is_cod", False))
        max_cod = vehicle.get("max_cod_limit_inr", self.max_cod_limit)

        if total_cod > max_cod:
            return False, f"COD Safety Limit Exceeded: ₹{total_cod:,.2f} > Max ₹{max_cod:,.2f}"
        
        return True, f"COD Amount ₹{total_cod:,.2f} within limit"

    def check_no_truck_zone_violation(self, vehicle: Dict[str, Any], stop: Dict[str, Any], estimated_arrival_time_str: str) -> Tuple[bool, str]:
        """
        Checks if a heavy commercial vehicle enters a restricted No-Truck zone during peak traffic prohibition hours.
        (e.g., Bengaluru Indiranagar/Whitefield 08:00-11:00 & 17:00-20:00).
        """
        v_type = vehicle.get("type", "VAN")
        # Small EVs & 3-wheelers are exempt from Indian urban no-truck entry bans
        if v_type in ["THREE_WHEELER_EV", "ELECTRIC_VAN"]:
            return True, "EV Exempt from No-Truck Zone"

        if not stop.get("no_truck_zone", False):
            return True, "Zone Clear"

        no_truck_hours = stop.get("no_truck_hours", [])
        if not no_truck_hours:
            return True, "No Active Prohibition"

        arr_time = datetime.strptime(estimated_arrival_time_str, "%H:%M").time()

        for slot in no_truck_hours:
            s_start_str, s_end_str = slot.split("-")
            t_start = datetime.strptime(s_start_str, "%H:%M").time()
            t_end = datetime.strptime(s_end_str, "%H:%M").time()

            if t_start <= arr_time <= t_end:
                return False, f"Violation: Heavy vehicle prohibited in {stop.get('zone_name')} between {slot}"

        return True, "Time Slot Permitted"

    def validate_full_route_constraints(self, vehicle: Dict[str, Any], stops: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs full validation sweep and returns structured report."""
        cap_ok, cap_msg = self.validate_vehicle_capacity(vehicle, stops)
        cod_ok, cod_msg = self.validate_cod_limit(vehicle, stops)

        violations = []
        if not cap_ok:
            violations.append(cap_msg)
        if not cod_ok:
            violations.append(cod_msg)

        total_cod = sum(s.get("cod_amount_inr", 0.0) for s in stops if s.get("is_cod", False))
        total_weight = sum(s.get("package_weight_kg", 1.0) for s in stops)

        return {
            "is_valid": len(violations) == 0,
            "violations": violations,
            "total_cod_inr": total_cod,
            "total_weight_kg": total_weight,
            "stops_count": len(stops)
        }
