# NYC Live Events - Prototype Data Structure

## Overview
All components now use centralized sample data from `/utils/eventData.ts` with **1,500 pre-generated events**.

## Data Structure

Each event follows this simple format:

```typescript
{
  id: string;                    // Unique identifier
  title: string;                 // Event name (140+ variations)
  category: EventCategory;       // One of 10 categories
  source: EventSource;           // One of 5 sources
  borough: Borough;              // One of 5 NYC boroughs
  timestamp: Date;               // Event date/time
  address?: string;              // Street address with real NYC street names
  lat?: number;                  // Latitude coordinate
  lng?: number;                  // Longitude coordinate
}
```

## Sample Event Example

```javascript
{
  id: "event-42-1702145678901-xyz123abc",
  title: "Live Jazz Night",
  category: "Music",
  source: "Eventbrite",
  borough: "Manhattan",
  timestamp: new Date("2025-12-15T19:30:00"),
  address: "742 Broadway, Manhattan, NY",
  lat: 40.7589,
  lng: -73.9851
}
```

## Categories (10)
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

## Sources (5)
- Instagram
- Eventbrite
- Ticketmaster
- Meetup
- Facebook Events

## Boroughs (5)
- Manhattan
- Brooklyn
- Queens
- Bronx
- Staten Island

## Data Distribution

- **Total Events**: 1,500 (5x larger than before!)
- **Date Range**: Today → +100 days
- **Events per Day**: Variable (10-25 events/day randomly distributed)
- **Geographic Coverage**: All 5 boroughs with realistic lat/lng coordinates
- **Time Distribution**: Weighted towards peak hours

### Realistic Distributions:

**Time of Day** (more realistic patterns):
- 10% Early Morning (6am-9am) - Yoga, Running, Breakfast events
- 20% Midday (10am-2pm) - Workshops, Meetups, Lunch events  
- 20% Afternoon (3pm-5pm) - Happy hours, Tours, Community events
- 35% Evening (6pm-10pm) - **Peak time** - Concerts, Shows, Dinners
- 15% Late Night (11pm-2am) - Nightlife, Club events, Late shows

**Category Distribution** (biased towards popular categories):
- 15% Music - Most popular
- 13% Food & Drink
- 12% Nightlife  
- 10% Community
- 10% Arts & Theater
- 40% Other categories (Sports, Comedy, Tech, Fitness, Family)

**Borough Distribution** (matches NYC event popularity):
- 30% Manhattan - Most events
- 25% Brooklyn - Second most
- 20% Queens
- 15% Bronx
- 10% Staten Island - Least events

**Event Titles**: 140+ unique variations including:
- Recurring series (Taco Tuesday, Jazz Brunch, Soul Food Sunday)
- Seasonal events (Spring Fling, Winter Festival, Halloween Party)
- Cultural events (Pride Parade, LGBTQ+ Mixer, Cultural Festival)
- Specialized activities (Dungeons & Dragons, Esports Tournament, Sound Bath)

**Addresses**: Realistic NYC street names per borough:
- Manhattan: Broadway, Park Ave, 5th Avenue, Madison Ave, etc.
- Brooklyn: Bedford Ave, Flatbush Ave, Atlantic Ave, etc.
- Queens: Queens Blvd, Roosevelt Ave, Northern Blvd, etc.
- Bronx: Grand Concourse, Fordham Rd, Jerome Ave, etc.
- Staten Island: Victory Blvd, Forest Ave, Bay St, etc.

## Components Using This Data

1. **App.tsx** - Main app, filters and displays all data
2. **EventMapWithMarkers.tsx** - Shows events on Google Maps
3. **LiveEventFeed.tsx** - Cycles through events to simulate live feed
4. **EventCard.tsx** - Displays individual event details
5. **TrendsChart.tsx** - Analyzes event trends by hour
6. **TimeOfDayAnalytics.tsx** - Shows peak hours
7. **ActivityHeatmap.tsx** - Borough × Time slot analysis

## How to Use

Import the sample events in any component:

```typescript
import { SAMPLE_EVENTS, Event, CATEGORIES, BOROUGHS } from '../utils/eventData';

// Use the data
const events: Event[] = SAMPLE_EVENTS;
```

## API Integration

The app tries to fetch real data from the backend API first, then falls back to `SAMPLE_EVENTS` if API is unavailable:

```typescript
const apiEvents = await loadEventsWithAPIFallback();
const allEvents = apiEvents.length > 0 ? apiEvents : SAMPLE_EVENTS;
```

This ensures the prototype always has data to display, even without a backend connection.