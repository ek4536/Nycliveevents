from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
from datetime import datetime

from config import settings
from database import db
from queue_handler import queue
from models import EventCreate, EventResponse, EventFilter

# Background task for queue processing
queue_task = None

# Lifespan context manager (not used - using on_event instead)
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     pass

# Create FastAPI app
app = FastAPI(
    title="Events Database API",
    description="Independent database API for event scrapers and website",
    version="1.0.0"
    # lifespan disabled for testing
)

# Connect to services on startup
print("\n=== Connecting to services ===")
db.connect()
queue.connect()
print("✓ Connected\n")

# Background processing - process queue items when they're added
import concurrent.futures
executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)

def process_queue_sync():
    """Sync wrapper for async queue processing"""
    import time
    print("Queue worker thread started")
    while True:
        try:
            # Get event from queue (blocking, 5 second timeout)
            event_json = queue.redis_client.blpop("events_queue", timeout=5) if queue.redis_client else None

            if event_json:
                event_data = json.loads(event_json[1])
                try:
                    # Insert into MongoDB
                    events = db.db["events"]
                    event_data["created_at"] = datetime.utcnow()
                    event_data["updated_at"] = datetime.utcnow()
                    event_data["status"] = "active"

                    result = events.update_one(
                        {"source_id": event_data["source_id"]},
                        {"$set": event_data},
                        upsert=True
                    )
                    print(f"✓ Processed event: {event_data.get('title')}")
                except Exception as e:
                    print(f"✗ Error processing event: {e}")
                    if queue.redis_client:
                        queue.redis_client.rpush("events_queue", event_json[1])
        except Exception as e:
            print(f"Queue worker error: {e}")
            time.sleep(1)

# Start queue worker in background thread
executor.submit(process_queue_sync)
print("✓ Queue worker started")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# SCRAPER API ENDPOINTS
# ============================================

@app.post("/api/scrapers/events", tags=["Scrapers"])
async def add_event_from_scraper(event: EventCreate) -> dict:
    """
    Add single event from scraper.
    Data goes to Redis queue, then processed to MongoDB.
    """
    try:
        event_data = event.model_dump()
        queue.add_event_to_queue(event_data)
        return {
            "status": "queued",
            "message": "Event added to processing queue",
            "event": event_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scrapers/events/bulk", tags=["Scrapers"])
async def add_bulk_events_from_scraper(events: list[EventCreate]) -> dict:
    """
    Add multiple events from scraper.
    Batch processing via Redis queue for efficiency.
    """
    try:
        events_data = [event.model_dump() for event in events]
        count = queue.add_bulk_events_to_queue(events_data)
        return {
            "status": "queued",
            "message": f"{count} events added to processing queue",
            "count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scrapers/health", tags=["Scrapers"])
async def scraper_health() -> dict:
    """Health check for scraper connectivity"""
    return {
        "status": "healthy",
        "mongodb": "connected",
        "redis": "connected"
    }

# ============================================
# WEBSITE API ENDPOINTS
# ============================================

@app.get("/api/website/events", response_model=dict, tags=["Website"])
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    date_from: str = Query(None),
    date_to: str = Query(None),
    location: str = Query(None),
    source: str = Query(None),
    tags: list[str] = Query(None),
    price_min: float = Query(None),
    price_max: float = Query(None),
) -> dict:
    """
    Get events with optional filters.
    Used by website to display events.
    """
    try:
        filters = {
            "date_from": date_from,
            "date_to": date_to,
            "location": location,
            "source": source,
            "tags": tags,
            "price_min": price_min,
            "price_max": price_max,
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}

        events, total = await db.get_events(skip=skip, limit=limit, filters=filters)

        # Convert ObjectId to string
        for event in events:
            event["_id"] = str(event["_id"])

        return {
            "status": "success",
            "data": events,
            "pagination": {
                "skip": skip,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/website/events/{event_id}", tags=["Website"])
async def get_event_detail(event_id: str) -> dict:
    """Get single event details"""
    try:
        from bson.objectid import ObjectId
        event = await db.get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        event["_id"] = str(event["_id"])
        return {
            "status": "success",
            "data": event
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/website/sources", tags=["Website"])
async def get_available_sources() -> dict:
    """Get list of available event sources"""
    try:
        sources = await db.db["events"].distinct("source")
        return {
            "status": "success",
            "data": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/website/health", tags=["Website"])
async def website_health() -> dict:
    """Health check for website connectivity"""
    return {
        "status": "healthy",
        "api": "running",
        "database": "connected"
    }

# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.get("/api/admin/stats", tags=["Admin"])
async def get_stats() -> dict:
    """Get statistics about events"""
    try:
        events_collection = db.db["events"]
        total_events = events_collection.count_documents({})
        active_events = events_collection.count_documents({"status": "active"})
        sources = await db.db["events"].distinct("source")

        return {
            "status": "success",
            "stats": {
                "total_events": total_events,
                "active_events": active_events,
                "sources_count": len(sources),
                "sources": sources
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/events/{event_id}", tags=["Admin"])
async def delete_event(event_id: str) -> dict:
    """Delete (soft) an event"""
    try:
        success = await db.delete_event(event_id)
        if not success:
            raise HTTPException(status_code=404, detail="Event not found")

        return {"status": "success", "message": "Event deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ROOT ENDPOINT
# ============================================

@app.get("/", tags=["Info"])
async def root() -> dict:
    """API information"""
    return {
        "name": "Events Database API",
        "version": "1.0.0",
        "endpoints": {
            "scrapers": "/api/scrapers/events (POST)",
            "website": "/api/website/events (GET)",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import os
    import uvicorn

    # Get port from environment variable (Render sets this) or use default
    port = int(os.getenv("PORT", settings.api_port))

    print(f"\n✓ API Server starting on http://0.0.0.0:{port}")
    print(f"  Docs: http://0.0.0.0:{port}/docs\n")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
