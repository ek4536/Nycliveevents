"""
Example: How website frontend would integrate with the Events API
This is a Python example, but your React/Vue frontend would do something similar
"""
import requests
from typing import List, Dict

API_URL = "http://localhost:8000"

class EventsAPI:
    """Client for consuming Events API from website"""

    @staticmethod
    def get_events(
        skip: int = 0,
        limit: int = 20,
        date_from: str = None,
        date_to: str = None,
        location: str = None,
        source: str = None,
        tags: List[str] = None,
        price_min: float = None,
        price_max: float = None
    ) -> Dict:
        """
        Fetch events with optional filters

        Example:
            events = EventsAPI.get_events(
                limit=10,
                location="San Francisco",
                tags=["tech", "conference"]
            )
        """
        try:
            params = {
                "skip": skip,
                "limit": limit,
            }
            if date_from:
                params["date_from"] = date_from
            if date_to:
                params["date_to"] = date_to
            if location:
                params["location"] = location
            if source:
                params["source"] = source
            if tags:
                params["tags"] = tags
            if price_min is not None:
                params["price_min"] = price_min
            if price_max is not None:
                params["price_max"] = price_max

            response = requests.get(
                f"{API_URL}/api/website/events",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching events: {e}")
            return {"status": "error", "data": []}

    @staticmethod
    def get_event_detail(event_id: str) -> Dict:
        """Get detailed information about a specific event"""
        try:
            response = requests.get(
                f"{API_URL}/api/website/events/{event_id}",
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching event detail: {e}")
            return {"status": "error", "data": None}

    @staticmethod
    def get_sources() -> Dict:
        """Get list of available event sources"""
        try:
            response = requests.get(
                f"{API_URL}/api/website/sources",
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching sources: {e}")
            return {"status": "error", "data": []}

    @staticmethod
    def check_health() -> bool:
        """Check if API is available"""
        try:
            response = requests.get(
                f"{API_URL}/api/website/health",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False

# ============================================
# USAGE EXAMPLES
# ============================================

if __name__ == "__main__":
    print("=== Events API Client Examples ===\n")

    # Example 1: Get all events
    print("1. Get all events:")
    result = EventsAPI.get_events(limit=5)
    print(f"   Found {result['pagination']['total']} total events")
    for event in result['data']:
        print(f"   - {event['title']} ({event['date']})")

    # Example 2: Filter by location
    print("\n2. Get events in San Francisco:")
    result = EventsAPI.get_events(location="San Francisco", limit=10)
    print(f"   Found {len(result['data'])} events")

    # Example 3: Filter by price range
    print("\n3. Get free events:")
    result = EventsAPI.get_events(price_max=0, limit=10)
    print(f"   Found {len(result['data'])} free events")

    # Example 4: Filter by tags
    print("\n4. Get tech events:")
    result = EventsAPI.get_events(tags=["tech"], limit=10)
    print(f"   Found {len(result['data'])} tech events")

    # Example 5: Get available sources
    print("\n5. Available event sources:")
    sources = EventsAPI.get_sources()
    print(f"   Sources: {sources['data']}")

    # Example 6: Get event detail
    print("\n6. Get event detail:")
    if result['data']:
        event_id = result['data'][0]['_id']
        detail = EventsAPI.get_event_detail(event_id)
        if detail.get('data'):
            print(f"   {detail['data']['title']}")
            print(f"   Location: {detail['data']['location']}")
            print(f"   Date: {detail['data']['date']}")

    # Example 7: Check API health
    print("\n7. API Health:")
    is_healthy = EventsAPI.check_health()
    print(f"   API Status: {'Healthy ✓' if is_healthy else 'Down ✗'}")
