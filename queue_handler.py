import redis
import json
import asyncio
from config import settings
from database import db
from typing import Optional

class RedisQueue:
    def __init__(self):
        self.redis_client = None

    def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_keepalive=True,
                health_check_interval=30
            )
            print("✓ Redis client created")
        except Exception as e:
            print(f"⚠ Redis connection warning: {e}")
            self.redis_client = None

    def disconnect(self):
        """Close Redis connection"""
        if self.redis_client:
            self.redis_client.close()
            print("✓ Disconnected from Redis")

    def add_event_to_queue(self, event_data: dict) -> bool:
        """Add event to Redis queue"""
        try:
            self.redis_client.rpush(
                "events_queue",
                json.dumps(event_data)
            )
            return True
        except Exception as e:
            print(f"Error adding to queue: {e}")
            return False

    def add_bulk_events_to_queue(self, events_data: list) -> int:
        """Add multiple events to queue"""
        try:
            pipe = self.redis_client.pipeline()
            for event in events_data:
                pipe.rpush("events_queue", json.dumps(event))
            pipe.execute()
            return len(events_data)
        except Exception as e:
            print(f"Error adding bulk events to queue: {e}")
            return 0

    async def process_queue(self):
        """Worker: Process events from queue and insert to MongoDB"""
        print("✓ Queue worker started")

        while True:
            try:
                # Get event from queue (blocking, 5 second timeout)
                event_json = self.redis_client.blpop("events_queue", timeout=5)

                if event_json:
                    event_data = json.loads(event_json[1])
                    try:
                        await db.insert_event(event_data)
                        print(f"✓ Processed event: {event_data.get('title')}")
                    except Exception as e:
                        print(f"✗ Error processing event: {e}")
                        # Re-add to queue for retry
                        self.redis_client.rpush("events_queue", event_json[1])

            except Exception as e:
                print(f"Queue worker error: {e}")
                await asyncio.sleep(1)

# Global queue instance
queue = RedisQueue()
