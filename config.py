from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # MongoDB
    mongo_uri: str
    mongo_db_name: str = "events_db"

    # Redis
    redis_url: str

    # API
    api_port: int = 8000
    api_host: str = "0.0.0.0"

    class Config:
        env_file = ".env"

settings = Settings()
