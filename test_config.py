#!/usr/bin/env python3

from pydantic_settings import BaseSettings
from pydantic import Field

class TestSettings(BaseSettings):
    environment: str = Field(default="development")
    api_host: str = Field(default="0.0.0.0")

    class Config:
        env_file = ".env"
        case_sensitive = False

if __name__ == "__main__":
    settings = TestSettings()
    print(f"Environment: {settings.environment}")
    print(f"API Host: {settings.api_host}")
    print(f"All fields: {list(settings.model_fields.keys())}")
