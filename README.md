# Events Database API

Independent database system for event scrapers and website.

## Architecture

```
Python Scrapers
    ↓ (POST /api/scrapers/events)
Redis Queue (Message Buffer)
    ↓ (Consumer Worker)
Database API (FastAPI)
    ↓ (Insert to MongoDB)
MongoDB Atlas
    ↑ (GET /api/website/events)
Website Frontend
```

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up MongoDB Atlas
- Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Create free cluster (512MB)
- Get connection string
- Add to `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events_db
```

### 3. Set Up Redis Cloud (Optional - for Phase 2)
- Create account at [redis.com/try-free](https://redis.com/try-free)
- Get connection string
- Add to `.env`:
```
REDIS_URL=redis://:password@host:port
```

### 4. Create `.env` File
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 5. Run API Server
```bash
python main.py
```

Server starts at `http://localhost:8000`

## API Endpoints

### For Scrapers (POST)

**Add single event:**
```bash
curl -X POST "http://localhost:8000/api/scrapers/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference",
    "description": "Annual tech conference",
    "location": "San Francisco, CA",
    "date": "2025-12-01",
    "time": "09:00",
    "source": "eventbrite",
    "source_url": "https://eventbrite.com/e/123",
    "source_id": "eventbrite_123",
    "price": 99.99,
    "tags": ["tech"]
  }'
```

**Add multiple events (bulk):**
```bash
curl -X POST "http://localhost:8000/api/scrapers/events/bulk" \
  -H "Content-Type: application/json" \
  -d '[
    {event1...},
    {event2...}
  ]'
```

**Health check:**
```bash
curl "http://localhost:8000/api/scrapers/health"
```

### For Website (GET)

**Get all events:**
```bash
curl "http://localhost:8000/api/website/events?limit=20&skip=0"
```

**Filter by location:**
```bash
curl "http://localhost:8000/api/website/events?location=San%20Francisco"
```

**Filter by date range:**
```bash
curl "http://localhost:8000/api/website/events?date_from=2025-01-01&date_to=2025-12-31"
```

**Filter by tags:**
```bash
curl "http://localhost:8000/api/website/events?tags=tech&tags=conference"
```

**Get event details:**
```bash
curl "http://localhost:8000/api/website/events/{event_id}"
```

**Get available sources:**
```bash
curl "http://localhost:8000/api/website/sources"
```

## Running Scrapers

### Example Python Scraper
```bash
python scraper_example.py
```

This will:
1. Connect to API
2. Check health
3. Scrape sample events
4. Send to `/api/scrapers/events/bulk`
5. Events go to Redis queue
6. Queue worker processes and inserts to MongoDB

### Integrate Your Own Scrapers
```python
from scraper_example import EventScraper

class MyCustomScraper(EventScraper):
    def __init__(self):
        super().__init__(source_name="my_source")

    def scrape_events(self):
        # Your scraping logic here
        return [
            {
                "title": "Event Title",
                "description": "...",
                "location": "...",
                "date": "2025-12-01",
                "source": "my_source",
                "source_url": "...",
                "source_id": "unique_id",
                # ... other fields
            }
        ]

    def run(self):
        events = self.scrape_events()
        self.send_bulk_events(events)
```

## Website Integration

### Python Example
```python
from website_integration import EventsAPI

# Get events
events = EventsAPI.get_events(limit=20, location="San Francisco")

# Get filtered events
tech_events = EventsAPI.get_events(tags=["tech", "conference"])

# Get sources
sources = EventsAPI.get_sources()
```

### JavaScript/React Example
```javascript
// Fetch all events
fetch('http://localhost:8000/api/website/events?limit=20')
  .then(r => r.json())
  .then(data => console.log(data.data))

// Fetch with filters
const params = new URLSearchParams({
  limit: 20,
  location: 'San Francisco',
  tags: 'tech'
})
fetch(`http://localhost:8000/api/website/events?${params}`)
  .then(r => r.json())
  .then(data => console.log(data.data))
```

## Data Flow

### Phase 1: Scraper to Queue to DB
1. Scraper collects events
2. Sends POST to `/api/scrapers/events/bulk`
3. Event data added to Redis queue
4. Queue worker picks up event
5. Validates & inserts to MongoDB
6. Website queries MongoDB via API

### Phase 2: Add Real-Time Updates (Future)
- Subscribe to events via WebSocket
- Push new events to connected website users
- Real-time notifications

## File Structure
```
├── main.py                 # FastAPI application
├── config.py              # Configuration & settings
├── database.py            # MongoDB operations
├── queue_handler.py       # Redis queue operations
├── models.py              # Pydantic data models
├── scraper_example.py     # Example scraper
├── website_integration.py # Website client example
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Deploy to Render (Free)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repo
4. Add environment variables
5. Deploy

### Deploy to Railway (Free)
1. Push code to GitHub
2. Create new project on Railway
3. Connect repo
4. Add environment variables
5. Deploy

## Monitoring

### Check queue status:
```bash
redis-cli
> LLEN events_queue  # See how many events waiting
```

### MongoDB stats:
Visit MongoDB Atlas dashboard to see:
- Document count
- Collection size
- Query performance

## Troubleshooting

**Cannot connect to MongoDB:**
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure network access enabled

**Queue not processing:**
- Check Redis connection
- Verify queue worker is running
- Check logs for errors

**High latency:**
- Add more queue workers
- Optimize MongoDB indexes
- Check API server resources

## Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Set up Redis Cloud
3. ✅ Run API server
4. ✅ Test with example scraper
5. ⏳ Integrate your own scrapers
6. ⏳ Build website frontend
7. ⏳ Deploy to production
