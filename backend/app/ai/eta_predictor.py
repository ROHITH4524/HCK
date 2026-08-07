import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

class ETAPredictor:
    """
    Machine Learning ETA Prediction Model.
    Predicts travel times accounting for distance, hour of day, weekday, weather, and Indian traffic congestion patterns.
    """

    def __init__(self, model_path="models/eta_model.joblib"):
        self.model_path = model_path
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        """Loads existing model or trains a synthetic base model if missing."""
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                return
            except Exception:
                pass
        
        self.train_synthetic_model()

    def train_synthetic_model(self):
        """Trains ML model using synthetic historical delivery data."""
        np.random.seed(42)
        n_samples = 2500

        # Features: [distance_km, hour_of_day, is_weekend, traffic_level (0-3), rain_mm]
        distances = np.random.uniform(0.5, 30.0, n_samples)
        hours = np.random.randint(6, 22, n_samples)
        is_weekend = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        traffic_levels = np.random.choice([0, 1, 2, 3], n_samples, p=[0.3, 0.4, 0.2, 0.1])
        rain_mm = np.random.exponential(scale=2.0, size=n_samples)

        # Baseline speed: 30 km/h (2 min/km)
        base_time = distances * 2.0
        # Peak traffic multiplier (8-11 AM & 5-8 PM)
        peak_multiplier = np.where(((hours >= 8) & (hours <= 11)) | ((hours >= 17) & (hours <= 20)), 1.45, 1.0)
        traffic_multiplier = 1.0 + (traffic_levels * 0.25)
        rain_multiplier = 1.0 + (rain_mm * 0.03)

        y_travel_time_min = base_time * peak_multiplier * traffic_multiplier * rain_multiplier
        y_travel_time_min += np.random.normal(0, 1.5, n_samples) # Noise
        y_travel_time_min = np.maximum(y_travel_time_min, 1.0)

        X = np.column_stack([distances, hours, is_weekend, traffic_levels, rain_mm])
        
        rf = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
        rf.fit(X, y_travel_time_min)

        self.model = rf
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(rf, self.model_path)

    def predict_travel_time(self, distance_km: float, hour_of_day: int = 10, is_weekend: bool = False, traffic_level: str = "MEDIUM") -> float:
        """Predicts travel time in minutes for a given leg."""
        traffic_map = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "SEVERE": 3}
        t_val = traffic_map.get(traffic_level.upper(), 1)
        w_val = 1 if is_weekend else 0

        X_input = np.array([[distance_km, hour_of_day, w_val, t_val, 0.0]])
        predicted_min = self.model.predict(X_input)[0]
        return round(float(predicted_min), 2)
