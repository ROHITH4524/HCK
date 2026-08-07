import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RouteMind - Adaptive Supply Chain Optimization"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "routemind_super_secret_jwt_key_2026_hackathon_edition"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # SQLite default fallback if PostgreSQL URL is not supplied
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./routemind.db")
    
    DATASET_PATH: str = os.getenv("DATASET_PATH", "dataset/amazon_last_mile_sample.json")
    
    # AI Constraints Defaults
    MAX_COD_PER_DRIVER_INR: float = 75000.0
    MAX_DRIVING_HOURS_PER_DAY: float = 9.0
    DEFAULT_AVERAGE_SPEED_KMH: float = 28.0 # Indian urban city average speed

    class Config:
        case_sensitive = True

settings = Settings()
