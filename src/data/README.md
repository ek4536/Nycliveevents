# NYC Live Events - Dataset Documentation

## Overview
This directory contains JSON data files for NYC events. The application automatically geocodes addresses to display events on the interactive map.

## Data Format

### events.json
The main events dataset. Each event should have the following structure:

```json
{
  "id": "unique_event_id",
  "name": "Event Name",
  "address": "Full NYC Address (street, city, state, zip)",
  "category": "Event Category",
  "source": "Data Source"
}
```

### Required Fields

- **id** (string): Unique identifier for the event (e.g., "evt_001", "evt_002")
- **name** (string): Full event name including venue if applicable
- **address** (string): Complete NYC address for geocoding
- **category** (string): Event category - must be one of:
  - Music
  - Arts & Theater
  - Food & Drink
  - Sports
  - Nightlife
  - Comedy
  - Community
  - Tech & Business
  - Fitness
  - Family

- **source** (string): Data source - must be one of:
  - Instagram
  - Eventbrite
  - Ticketmaster
  - Meetup
  - Facebook Events

### Address Format Guidelines

For best geocoding results, use complete NYC addresses:

**Good Examples:**
- `"131 W 3rd St, New York, NY 10012"`
- `"620 Atlantic Ave, Brooklyn, NY 11217"`
- `"47-01 111th St, Queens, NY 11368"`
- `"1 E 161st St, Bronx, NY 10451"`
- `"1000 Richmond Terrace, Staten Island, NY 10301"`

**Include:**
- Street number and name
- Borough (Manhattan = "New York, NY", or "Brooklyn, NY", etc.)
- ZIP code when possible

### Adding New Events

1. Open `/utils/dataLoader.ts`
2. Find the `eventsData` array (around line 11)
3. Add a new event object to the array following the format above
4. Ensure the ID is unique
5. Use a complete address for accurate map placement
6. Save the file - the app will automatically load and geocode the new events

### Geocoding Notes

The application uses a custom NYC geocoding utility that:
- Recognizes major NYC landmarks (Madison Square Garden, Central Park, etc.)
- Understands NYC neighborhoods (SoHo, Williamsburg, Astoria, etc.)
- Approximates locations based on street numbers and borough
- Groups nearby events to prevent marker overlap on the map

**No latitude/longitude is needed** - the app automatically converts addresses to coordinates!

### Example: Adding a New Event

```json
{
  "id": "evt_031",
  "name": "Jazz Brunch at Birdland",
  "address": "315 W 44th St, New York, NY 10036",
  "category": "Music",
  "source": "Eventbrite"
}
```

## Data Sources

Events can be imported from:
- Instagram event posts
- Eventbrite listings
- Ticketmaster events
- Meetup.com gatherings
- Facebook Events

## Tips for Data Collection

- Include venue names in the event title for better context
- Use official venue addresses for accuracy
- Verify borough information is correct in the address
- Check that categories match exactly (case-sensitive)
- Ensure data sources are from the approved list
