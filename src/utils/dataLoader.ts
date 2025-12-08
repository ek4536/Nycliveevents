import { Event, EventCategory, EventSource, Borough } from './eventData';
import { geocodeNYCAddress, getBoroughFromAddress } from './geocoding';

interface RawEventData {
  id: string;
  name: string;
  address: string;
  category: string;
  source: string;
}

// Inline the events data
const eventsData: RawEventData[] = [
  {
    id: "evt_001",
    name: "Live Jazz Night at Blue Note",
    address: "131 W 3rd St, New York, NY 10012",
    category: "Music",
    source: "Eventbrite"
  },
  {
    id: "evt_002",
    name: "Broadway Show: Hamilton",
    address: "226 W 46th St, New York, NY 10036",
    category: "Arts & Theater",
    source: "Ticketmaster"
  },
  {
    id: "evt_003",
    name: "Food Truck Festival",
    address: "Central Park West & W 72nd St, New York, NY 10023",
    category: "Food & Drink",
    source: "Instagram"
  },
  {
    id: "evt_004",
    name: "Knicks Game",
    address: "4 Pennsylvania Plaza, New York, NY 10001",
    category: "Sports",
    source: "Ticketmaster"
  },
  {
    id: "evt_005",
    name: "Rooftop Party at 230 Fifth",
    address: "230 5th Ave, New York, NY 10001",
    category: "Nightlife",
    source: "Facebook Events"
  },
  {
    id: "evt_006",
    name: "Comedy Club Night",
    address: "117 MacDougal St, New York, NY 10012",
    category: "Comedy",
    source: "Meetup"
  },
  {
    id: "evt_007",
    name: "Brooklyn Street Fair",
    address: "5th Ave & Union St, Brooklyn, NY 11215",
    category: "Community",
    source: "Instagram"
  },
  {
    id: "evt_008",
    name: "Tech Startup Meetup",
    address: "175 Varick St, New York, NY 10014",
    category: "Tech & Business",
    source: "Meetup"
  },
  {
    id: "evt_009",
    name: "Yoga in Prospect Park",
    address: "Prospect Park West & 9th St, Brooklyn, NY 11215",
    category: "Fitness",
    source: "Instagram"
  },
  {
    id: "evt_010",
    name: "Children's Museum Workshop",
    address: "145 Brooklyn Ave, Brooklyn, NY 11213",
    category: "Family",
    source: "Facebook Events"
  },
  {
    id: "evt_011",
    name: "Hip Hop Showcase",
    address: "6 Delancey St, New York, NY 10002",
    category: "Music",
    source: "Instagram"
  },
  {
    id: "evt_012",
    name: "Art Gallery Opening in DUMBO",
    address: "55 Washington St, Brooklyn, NY 11201",
    category: "Arts & Theater",
    source: "Eventbrite"
  },
  {
    id: "evt_013",
    name: "Wine Tasting Event",
    address: "409 3rd Ave, New York, NY 10016",
    category: "Food & Drink",
    source: "Eventbrite"
  },
  {
    id: "evt_014",
    name: "Yankees Game",
    address: "1 E 161st St, Bronx, NY 10451",
    category: "Sports",
    source: "Ticketmaster"
  },
  {
    id: "evt_015",
    name: "DJ Set at Output",
    address: "74 Wythe Ave, Brooklyn, NY 11249",
    category: "Nightlife",
    source: "Instagram"
  },
  {
    id: "evt_016",
    name: "Stand-up Comedy Showcase",
    address: "208 W 23rd St, New York, NY 10011",
    category: "Comedy",
    source: "Facebook Events"
  },
  {
    id: "evt_017",
    name: "Queens Night Market",
    address: "47-01 111th St, Queens, NY 11368",
    category: "Food & Drink",
    source: "Instagram"
  },
  {
    id: "evt_018",
    name: "Hackathon at Google NYC",
    address: "111 8th Ave, New York, NY 10011",
    category: "Tech & Business",
    source: "Meetup"
  },
  {
    id: "evt_019",
    name: "CrossFit Community Workout",
    address: "28-10 Jackson Ave, Queens, NY 11101",
    category: "Fitness",
    source: "Meetup"
  },
  {
    id: "evt_020",
    name: "Bronx Zoo Family Day",
    address: "2300 Southern Blvd, Bronx, NY 10460",
    category: "Family",
    source: "Facebook Events"
  },
  {
    id: "evt_021",
    name: "EDM Festival at Brooklyn Mirage",
    address: "140 Stewart Ave, Brooklyn, NY 11237",
    category: "Music",
    source: "Ticketmaster"
  },
  {
    id: "evt_022",
    name: "Off-Broadway Theater Performance",
    address: "410 W 42nd St, New York, NY 10036",
    category: "Arts & Theater",
    source: "Eventbrite"
  },
  {
    id: "evt_023",
    name: "Craft Beer Festival",
    address: "80 35th St, Brooklyn, NY 11232",
    category: "Food & Drink",
    source: "Instagram"
  },
  {
    id: "evt_024",
    name: "Nets Game at Barclays Center",
    address: "620 Atlantic Ave, Brooklyn, NY 11217",
    category: "Sports",
    source: "Ticketmaster"
  },
  {
    id: "evt_025",
    name: "Speakeasy Experience",
    address: "129 MacDougal St, New York, NY 10012",
    category: "Nightlife",
    source: "Instagram"
  },
  {
    id: "evt_026",
    name: "Improv Comedy Night",
    address: "307 W 26th St, New York, NY 10001",
    category: "Comedy",
    source: "Meetup"
  },
  {
    id: "evt_027",
    name: "Staten Island Cultural Festival",
    address: "1000 Richmond Terrace, Staten Island, NY 10301",
    category: "Community",
    source: "Facebook Events"
  },
  {
    id: "evt_028",
    name: "Product Launch Event",
    address: "601 W 26th St, New York, NY 10001",
    category: "Tech & Business",
    source: "Eventbrite"
  },
  {
    id: "evt_029",
    name: "Spin Class at SoulCycle",
    address: "103 Warren St, New York, NY 10007",
    category: "Fitness",
    source: "Instagram"
  },
  {
    id: "evt_030",
    name: "Kids Art Workshop",
    address: "200 Eastern Pkwy, Brooklyn, NY 11238",
    category: "Family",
    source: "Meetup"
  }
];

/**
 * Load events from JSON file and geocode addresses
 */
export function loadEventsFromJSON(): Event[] {
  const events: Event[] = [];
  const now = new Date();
  
  eventsData.forEach((rawEvent, index) => {
    // Geocode the address
    const coords = geocodeNYCAddress(rawEvent.address);
    
    if (coords) {
      // Determine borough from address
      const borough = getBoroughFromAddress(rawEvent.address) as Borough;
      
      // Create timestamp (spread events throughout the day)
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
      
      events.push({
        id: rawEvent.id,
        title: rawEvent.name,
        category: rawEvent.category as EventCategory,
        source: rawEvent.source as EventSource,
        borough,
        venue: extractVenueName(rawEvent.name),
        timestamp,
        address: rawEvent.address,
        lat: coords.lat,
        lng: coords.lng,
        attendees: Math.floor(Math.random() * 500) + 10,
        price: Math.random() > 0.3 ? ['$15', '$25', '$35', '$50'][Math.floor(Math.random() * 4)] : 'Free'
      });
    }
  });
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Extract venue name from event title
 */
function extractVenueName(eventName: string): string {
  // Try to extract venue after "at" keyword
  const atMatch = eventName.match(/at\s+(.+)/i);
  if (atMatch) {
    return atMatch[1].trim();
  }
  
  // Otherwise use the full event name
  return eventName;
}

/**
 * Merge JSON events with generated historical events
 */
export function mergeEventsData(jsonEvents: Event[], historicalEvents: Event[]): Event[] {
  // Combine both datasets
  const allEvents = [...jsonEvents, ...historicalEvents];
  
  // Remove duplicates based on ID
  const uniqueEvents = allEvents.filter((event, index, self) =>
    index === self.findIndex((e) => e.id === event.id)
  );
  
  // Sort by timestamp (newest first)
  return uniqueEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Load events for a specific date range
 */
export function loadEventsForDateRange(startDate: Date, endDate: Date): Event[] {
  const jsonEvents = loadEventsFromJSON();
  
  // Filter events within the date range
  return jsonEvents.filter(event => {
    return event.timestamp >= startDate && event.timestamp <= endDate;
  });
}
