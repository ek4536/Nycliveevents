from pymongo import MongoClient
from config import settings
from typing import Optional, List, Dict
from datetime import datetime
from bson.objectid import ObjectId
import json

class MongoDB:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            self.client = MongoClient(
                settings.mongo_uri,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
                socketTimeoutMS=2000,
                retryWrites=True
            )
            self.db = self.client[settings.mongo_db_name]
            print("✓ MongoDB client created")
            # Don't ping during startup - do it lazily
        except Exception as e:
            print(f"⚠ MongoDB connection issue: {e}")
            self.client = None
            self.db = None

    def _create_indexes(self):
        """Create necessary indexes"""
        if not self.db:
            return
        try:
            events = self.db["events"]
            events.create_index("source_id", unique=True)
            events.create_index("date")
            events.create_index("location")
            events.create_index("source")
            events.create_index("tags")
            print("✓ Indexes created")
        except Exception as e:
            print(f"⚠ Could not create indexes: {e}")

    def disconnect(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")

    # Scraper API methods
    async def insert_event(self, event_data: dict) -> str:
        """Insert new event or update if exists (by source_id)"""
        events = self.db["events"]
        event_data["created_at"] = datetime.utcnow()
        event_data["updated_at"] = datetime.utcnow()
        event_data["status"] = "active"

        # Upsert: insert if new, update if exists
        result = events.update_one(
            {"source_id": event_data["source_id"]},
            {"$set": event_data},
            upsert=True
        )

        return str(result.upserted_id or result.matched_id)

    async def bulk_insert_events(self, events_data: List[dict]) -> int:
        """Insert multiple events"""
        if not events_data:
            return 0

        events = self.db["events"]
        for event in events_data:
            event["created_at"] = datetime.utcnow()
            event["updated_at"] = datetime.utcnow()
            event["status"] = "active"

        # Upsert multiple events
        from pymongo import UpdateOne
        operations = [
            UpdateOne(
                {"source_id": event["source_id"]},
                {"$set": event},
                upsert=True
            )
            for event in events_data
        ]

        result = events.bulk_write(operations)
        return result.upserted_count + result.modified_count

    # Website API methods
    async def get_events(
        self,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[Dict] = None
    ) -> tuple[List[dict], int]:
        """Get events with pagination and filters"""
        events = self.db["events"]

        # Build filter query
        query = {"status": "active"}
        if filters:
            if filters.get("date_from"):
                query["date"] = {"$gte": filters["date_from"]}
            if filters.get("date_to"):
                if "date" in query:
                    query["date"]["$lte"] = filters["date_to"]
                else:
                    query["date"] = {"$lte": filters["date_to"]}

            if filters.get("location"):
                query["location"] = {"$regex": filters["location"], "$options": "i"}

            if filters.get("source"):
                query["source"] = filters["source"]

            if filters.get("tags"):
                query["tags"] = {"$in": filters["tags"]}

            if filters.get("price_min") or filters.get("price_max"):
                price_query = {}
                if filters.get("price_min") is not None:
                    price_query["$gte"] = filters["price_min"]
                if filters.get("price_max") is not None:
                    price_query["$lte"] = filters["price_max"]
                query["price"] = price_query

        # Execute query
        total = events.count_documents(query)
        results = list(
            events.find(query)
            .sort("date", 1)
            .skip(skip)
            .limit(limit)
        )

        return results, total

    async def get_event_by_id(self, event_id: str) -> Optional[dict]:
        """Get single event by ID"""
        events = self.db["events"]
        return events.find_one({"_id": ObjectId(event_id)})

    async def get_events_by_source(self, source: str) -> List[dict]:
        """Get all events from specific source"""
        events = self.db["events"]
        return list(events.find({"source": source, "status": "active"}))

    async def delete_event(self, event_id: str) -> bool:
        """Soft delete event (mark as cancelled)"""
        events = self.db["events"]
        result = events.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

# Global database instance
db = MongoDB()
