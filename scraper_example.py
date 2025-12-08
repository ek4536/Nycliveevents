"""
Example scraper that sends events to the database API
"""
import requests
import json
from datetime import datetime, timedelta
from typing import List

# Configuration
API_URL = "http://localhost:8000"
SCRAPER_ENDPOINT = f"{API_URL}/api/scrapers/events"
BULK_ENDPOINT = f"{API_URL}/api/scrapers/events/bulk"

class EventScraper:
    """Base scraper class"""

    def __init__(self, source_name: str):
        self.source_name = source_name

    def send_event(self, event_data: dict) -> bool:
        """Send single event to API"""
        try:
            response = requests.post(
                SCRAPER_ENDPOINT,
                json=event_data,
                timeout=10
            )
            if response.status_code == 200:
                print(f"✓ Event sent: {event_data['title']}")
                return True
            else:
                print(f"✗ Failed to send event: {response.text}")
                return False
        except Exception as e:
            print(f"✗ Error sending event: {e}")
            return False

    def send_bulk_events(self, events_data: List[dict]) -> int:
        """Send multiple events to API"""
        try:
            response = requests.post(
                BULK_ENDPOINT,
                json=events_data,
                timeout=15
            )
            if response.status_code == 200:
                data = response.json()
                print(f"✓ {data['count']} events sent to queue")
                return data['count']
            else:
                print(f"✗ Failed to send bulk events: {response.text}")
                return 0
        except Exception as e:
            print(f"✗ Error sending bulk events: {e}")
            return 0

    def check_health(self) -> bool:
        """Check if API is healthy"""
        try:
            response = requests.get(
                f"{API_URL}/api/scrapers/health",
                timeout=5
            )
            if response.status_code == 200:
                print("✓ API is healthy")
                return True
            else:
                print("✗ API is not healthy")
                return False
        except Exception as e:
            print(f"✗ Cannot reach API: {e}")
            return False

# ============================================
# EXAMPLE: EventBrite Scraper
# ============================================

class EventbriteScraper(EventScraper):
    """Example scraper for Eventbrite events"""

    def __init__(self):
        super().__init__(source_name="eventbrite")

    def scrape_events(self) -> List[dict]:
        """
        Scrape events from Eventbrite
        (This is a mock example - replace with actual scraping logic)
        """
        events = [
            {
                "title": "Python Conference 2025",
                "description": "Annual Python developers conference",
                "location": "San Francisco, CA",
                "date": "2025-06-15",
                "time": "09:00",
                "source": "eventbrite",
                "source_url": "https://eventbrite.com/e/123",
                "source_id": "eventbrite_123",
                "price": 199.99,
                "image_url": "https://example.com/image.jpg",
                "tags": ["python", "conference", "tech"]
            },
            {
                "title": "Web Development Meetup",
                "description": "Monthly meetup for web developers",
                "location": "New York, NY",
                "date": "2025-06-20",
                "time": "18:30",
                "source": "eventbrite",
                "source_url": "https://eventbrite.com/e/456",
                "source_id": "eventbrite_456",
                "price": 0.0,
                "image_url": None,
                "tags": ["web", "meetup"]
            }
        ]
        return events

    def run(self):
        """Run the scraper"""
        print(f"\n=== {self.source_name.upper()} Scraper ===")

        # Check API health first
        if not self.check_health():
            print("Aborting scraper - API not available")
            return

        # Scrape events
        events = self.scrape_events()
        print(f"Found {len(events)} events")

        # Send to API
        self.send_bulk_events(events)

# ============================================
# EXAMPLE: Meetup Scraper
# ============================================

class MeetupScraper(EventScraper):
    """Example scraper for Meetup events"""

    def __init__(self):
        super().__init__(source_name="meetup")

    def scrape_events(self) -> List[dict]:
        """Scrape events from Meetup"""
        events = [
            {
                "title": "React Advanced Patterns",
                "description": "Deep dive into React patterns and best practices",
                "location": "Austin, TX",
                "date": "2025-06-18",
                "time": "19:00",
                "source": "meetup",
                "source_url": "https://meetup.com/e/789",
                "source_id": "meetup_789",
                "price": None,
                "tags": ["react", "javascript"]
            }
        ]
        return events

    def run(self):
        """Run the scraper"""
        print(f"\n=== {self.source_name.upper()} Scraper ===")

        if not self.check_health():
            print("Aborting scraper - API not available")
            return

        events = self.scrape_events()
        print(f"Found {len(events)} events")
        self.send_bulk_events(events)

# ============================================
# MAIN: Run all scrapers
# ============================================

if __name__ == "__main__":
    print("Starting Event Scrapers...")

    # Run multiple scrapers
    eventbrite = EventbriteScraper()
    eventbrite.run()

    meetup = MeetupScraper()
    meetup.run()

    print("\n✓ All scrapers completed")
