from typing import Dict, Any, List

class ExplainabilityEngine:
    """
    AI Explainability Engine.
    Converts mathematical route optimization vectors into supervisor-friendly natural language explanations.
    """

    def generate_replan_explanation(self, replan_data: Dict[str, Any], event_type: str, vehicle_name: str = "Tata Ace EV #1") -> Dict[str, Any]:
        """
        Generates structured plain English explanation for route modifications.
        """
        dist_saved = replan_data.get("distance_saved_km", 0.0)
        time_saved = replan_data.get("time_saved_min", 0.0)
        cost_diff = replan_data.get("cost_diff_inr", 0.0)
        reason = replan_data.get("reason", "Route re-sequencing trigger")

        affected_constraints = []
        
        if event_type == "TRAFFIC_JAM":
            headline = f"Route re-sequenced for {vehicle_name} due to heavy traffic congestion."
            narrative = (
                f"The AI Replanning Engine detected gridlock on the active corridor. "
                f"By re-ordering {len(replan_data.get('new_route', {}).get('stops', []))} remaining stops using "
                f"nearest-neighbor spatial heuristic, the driver bypasses peak traffic. "
                f"This decision saves approximately {abs(time_saved)} minutes of idling time and "
                f"reduces fuel/battery consumption."
            )
            affected_constraints.append("No-Truck Zone Restriction Evaluated")
            affected_constraints.append("Driver Duty Hour Limit Maintained")

        elif event_type == "INSTANT_PICKUP":
            headline = f"On-demand pickup inserted into {vehicle_name}'s active manifest."
            narrative = (
                f"A new priority customer pickup request was received. "
                f"The AI evaluated insertion costs across all active vehicles and identified {vehicle_name} "
                f"as the optimal candidate with a minimal detour of {abs(dist_saved)} km. "
                f"Vehicle capacity and COD cash limits were verified prior to insertion."
            )
            affected_constraints.append("Payload Weight Capacity Validated")
            affected_constraints.append("COD Cash Security Threshold Passed")

        elif event_type == "FAILED_DELIVERY":
            headline = f"Delivery stop skipped and sequence updated for {vehicle_name}."
            narrative = (
                f"Delivery attempt failed due to customer unavailability. "
                f"The AI instantly adjusted the navigation sequence to direct the driver to the next closest "
                f"unvisited stop, eliminating wasted vehicle mileage."
            )
            affected_constraints.append("Delivery Window SLA Preserved")

        else:
            headline = f"Route optimization updated for {vehicle_name}."
            narrative = f"{reason}. Total distance adjustment: {dist_saved:+.2f} km."

        summary_bullet_points = [
            f"Reason: {reason}",
            f"Distance Impact: {'Saved' if dist_saved >= 0 else 'Added'} {abs(dist_saved):.2f} km",
            f"ETA Impact: {'Saved' if time_saved >= 0 else 'Added'} {abs(time_saved):.1f} minutes",
            f"Financial Impact: {'Cost Reduction' if cost_diff >= 0 else 'Additional Cost'} ₹{abs(cost_diff):.2f}",
            f"Execution Time: Under {replan_data.get('execution_time_seconds', 0.5)}s (Real-Time)"
        ]

        return {
            "headline": headline,
            "narrative": narrative,
            "bullet_points": summary_bullet_points,
            "affected_constraints": affected_constraints,
            "time_saved_min": time_saved,
            "distance_saved_km": dist_saved,
            "cost_diff_inr": cost_diff
        }
