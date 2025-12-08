from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EventStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventCreate(BaseModel):
    """Schema for scrapers to create events"""
    title: str
    description: str
    location: str
    date: str  # ISO format: "2025-12-01"
    time: Optional[str] = None  # "14:30"
    source: str  # e.g., "eventbrite", "meetup", "facebook"
    source_url: str
    source_id: str  # Unique ID from source
    price: Optional[float] = None
    image_url: Optional[str] = None
    tags: List[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Tech Conference 2025",
                "description": "Annual tech conference",
                "location": "San Francisco, CA",
                "date": "2025-12-01",
                "time": "09:00",
                "source": "eventbrite",
                "source_url": "https://eventbrite.com/e/123",
                "source_id": "eventbrite_123",
                "price": 99.99,
                "tags": ["tech", "conference"]
            }
        }

class EventResponse(BaseModel):
    """Schema for website to read events"""
    id: str = Field(alias="_id")
    title: str
    description: str
    location: str
    date: str
    time: Optional[str]
    source: str
    source_url: str
    price: Optional[float]
    image_url: Optional[str]
    tags: List[str]
    status: EventStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class EventFilter(BaseModel):
    """Schema for website to filter events"""
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
