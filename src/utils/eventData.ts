export type EventSource = 'Instagram' | 'Eventbrite' | 'Ticketmaster' | 'Meetup' | 'Facebook Events';
export type EventCategory = 'Music' | 'Arts & Theater' | 'Food & Drink' | 'Sports' | 'Nightlife' | 'Comedy' | 'Community' | 'Tech & Business' | 'Fitness' | 'Family';
export type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  source: EventSource;
  borough: Borough;
  venue: string;
  timestamp: Date;
  attendees?: number;
  price?: string;
}

const categories: EventCategory[] = ['Music', 'Arts & Theater', 'Food & Drink', 'Sports', 'Nightlife', 'Comedy', 'Community', 'Tech & Business', 'Fitness', 'Family'];
const sources: EventSource[] = ['Instagram', 'Eventbrite', 'Ticketmaster', 'Meetup', 'Facebook Events'];
const boroughs: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

const musicEvents = [
  'Live Jazz Night', 'Hip Hop Showcase', 'Indie Rock Concert', 'EDM Festival', 'Classical Symphony', 
  'Open Mic Night', 'DJ Battle', 'Karaoke Night', 'Acoustic Sessions', 'R&B Live'
];

const artsEvents = [
  'Broadway Show', 'Off-Broadway Performance', 'Art Gallery Opening', 'Modern Dance', 'Opera Night',
  'Experimental Theater', 'Stand-up Comedy', 'Improv Show', 'Poetry Slam', 'Film Screening'
];

const foodEvents = [
  'Food Truck Festival', 'Wine Tasting', 'Craft Beer Night', 'Restaurant Week', 'Cooking Class',
  'Street Food Fair', 'Coffee Roasting Workshop', 'Mixology Class', 'Farmers Market', 'Brunch Pop-up'
];

const sportsEvents = [
  'Knicks Game', 'Yankees Game', 'Nets Game', 'Rangers Game', 'NYCFC Match',
  'Marathon', 'Basketball Tournament', 'Yoga in the Park', 'Rock Climbing', 'Cycling Event'
];

const nightlifeEvents = [
  'Rooftop Party', 'Club Night', 'Speakeasy Experience', 'Late Night Dance', 'Lounge Event',
  'DJ Set', 'After Hours', 'Bar Crawl', 'Cocktail Soiree', 'House Party'
];

const comedyEvents = [
  'Comedy Club Night', 'Stand-up Showcase', 'Improv Comedy', 'Sketch Comedy', 'Comedy Open Mic',
  'Roast Battle', 'Late Night Comedy', 'Comedy Festival', 'Storytelling Night', 'Variety Show'
];

const communityEvents = [
  'Neighborhood Meetup', 'Community Garden', 'Block Party', 'Volunteer Day', 'Town Hall',
  'Book Club', 'Cultural Festival', 'Street Fair', 'Cleanup Day', 'Charity Event'
];

const techEvents = [
  'Startup Pitch Night', 'Tech Meetup', 'Networking Event', 'Hackathon', 'Product Launch',
  'Workshop: AI', 'Coding Bootcamp', 'Developer Conference', 'Investor Meetup', 'Blockchain Talk'
];

const fitnessEvents = [
  'Yoga Class', 'CrossFit Session', 'Running Club', 'Spin Class', 'Boxing Workout',
  'HIIT Training', 'Pilates', 'Outdoor Bootcamp', 'Dance Fitness', 'Meditation Session'
];

const familyEvents = [
  'Kids Workshop', 'Family Movie Night', 'Zoo Trip', 'Museum Day', 'Puppet Show',
  'Children\'s Theater', 'Park Playdate', 'Story Time', 'Science Fair', 'Art Class for Kids'
];

const eventsByCategory: Record<EventCategory, string[]> = {
  'Music': musicEvents,
  'Arts & Theater': artsEvents,
  'Food & Drink': foodEvents,
  'Sports': sportsEvents,
  'Nightlife': nightlifeEvents,
  'Comedy': comedyEvents,
  'Community': communityEvents,
  'Tech & Business': techEvents,
  'Fitness': fitnessEvents,
  'Family': familyEvents
};

const venues: Record<Borough, string[]> = {
  'Manhattan': ['Madison Square Garden', 'Lincoln Center', 'The Bowery Ballroom', 'Brooklyn Bowl', 'Mercury Lounge', 'Times Square', 'Central Park', 'Union Square'],
  'Brooklyn': ['Barclays Center', 'Brooklyn Steel', 'Prospect Park', 'Brooklyn Museum', 'Williamsburg Waterfront', 'DUMBO', 'Park Slope', 'Bushwick Collective'],
  'Queens': ['Citi Field', 'Forest Hills Stadium', 'Flushing Meadows', 'Astoria Park', 'Long Island City', 'Rockaway Beach', 'Jamaica Center', 'Queens Museum'],
  'Bronx': ['Yankee Stadium', 'Bronx Zoo', 'The Bronx Museum', 'Pelham Bay Park', 'Arthur Avenue', 'Van Cortlandt Park', 'South Bronx', 'Fordham'],
  'Staten Island': ['St. George Theatre', 'Snug Harbor', 'Staten Island Zoo', 'Historic Richmond Town', 'South Beach', 'Boardwalk', 'Clove Lakes Park', 'Greenbelt']
};

// Simulate time-based popularity - certain categories are more popular at different times
export function getCategoryWeight(category: EventCategory, hour: number): number {
  const weights: Record<EventCategory, { peak: number[], weight: number }> = {
    'Music': { peak: [18, 19, 20, 21, 22], weight: 1.5 },
    'Arts & Theater': { peak: [19, 20], weight: 1.3 },
    'Food & Drink': { peak: [11, 12, 18, 19], weight: 1.4 },
    'Sports': { peak: [10, 14, 18, 19], weight: 1.2 },
    'Nightlife': { peak: [21, 22, 23], weight: 2.0 },
    'Comedy': { peak: [19, 20, 21], weight: 1.3 },
    'Community': { peak: [10, 11, 14, 15], weight: 1.1 },
    'Tech & Business': { peak: [9, 10, 18, 19], weight: 1.2 },
    'Fitness': { peak: [6, 7, 8, 17, 18], weight: 1.3 },
    'Family': { peak: [10, 11, 14, 15, 16], weight: 1.2 }
  };
  
  const categoryInfo = weights[category];
  return categoryInfo.peak.includes(hour) ? categoryInfo.weight : 1.0;
}

export function generateRandomEvent(): Event {
  const now = new Date();
  const hour = now.getHours();
  
  // Weight category selection by time of day
  let category: EventCategory;
  const rand = Math.random();
  let cumulativeWeight = 0;
  const totalWeight = categories.reduce((sum, cat) => sum + getCategoryWeight(cat, hour), 0);
  
  for (const cat of categories) {
    cumulativeWeight += getCategoryWeight(cat, hour) / totalWeight;
    if (rand <= cumulativeWeight) {
      category = cat;
      break;
    }
  }
  category = category! || categories[Math.floor(Math.random() * categories.length)];
  
  const source = sources[Math.floor(Math.random() * sources.length)];
  const borough = boroughs[Math.floor(Math.random() * boroughs.length)];
  const venue = venues[borough][Math.floor(Math.random() * venues[borough].length)];
  const eventNames = eventsByCategory[category];
  const title = eventNames[Math.floor(Math.random() * eventNames.length)];
  
  const prices = ['Free', '$15', '$25', '$35', '$50', '$75', '$100'];
  const price = Math.random() > 0.3 ? prices[Math.floor(Math.random() * prices.length)] : 'Free';
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    category,
    source,
    borough,
    venue,
    timestamp: new Date(),
    attendees: Math.floor(Math.random() * 500) + 10,
    price
  };
}

// Generate historical data for trends
export function generateHistoricalData(hours: number = 24): Event[] {
  const events: Event[] = [];
  const now = new Date();
  
  for (let i = hours; i > 0; i--) {
    const eventsPerHour = Math.floor(Math.random() * 15) + 10;
    for (let j = 0; j < eventsPerHour; j++) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000) + (Math.random() * 60 * 60 * 1000));
      const hour = timestamp.getHours();
      
      let category: EventCategory;
      const rand = Math.random();
      let cumulativeWeight = 0;
      const totalWeight = categories.reduce((sum, cat) => sum + getCategoryWeight(cat, hour), 0);
      
      for (const cat of categories) {
        cumulativeWeight += getCategoryWeight(cat, hour) / totalWeight;
        if (rand <= cumulativeWeight) {
          category = cat;
          break;
        }
      }
      category = category! || categories[Math.floor(Math.random() * categories.length)];
      
      const source = sources[Math.floor(Math.random() * sources.length)];
      const borough = boroughs[Math.floor(Math.random() * boroughs.length)];
      const venue = venues[borough][Math.floor(Math.random() * venues[borough].length)];
      const eventNames = eventsByCategory[category];
      const title = eventNames[Math.floor(Math.random() * eventNames.length)];
      
      events.push({
        id: `${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        category,
        source,
        borough,
        venue,
        timestamp,
        attendees: Math.floor(Math.random() * 500) + 10,
        price: Math.random() > 0.3 ? ['$15', '$25', '$35', '$50'][Math.floor(Math.random() * 4)] : 'Free'
      });
    }
  }
  
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export const CATEGORIES = categories;
export const BOROUGHS = boroughs;
export const SOURCES = sources;
