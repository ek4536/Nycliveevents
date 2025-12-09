export type EventSource = 'Instagram' | 'Eventbrite' | 'Ticketmaster' | 'Meetup' | 'Facebook Events';
export type EventCategory = 'Music' | 'Arts & Theater' | 'Food & Drink' | 'Sports' | 'Nightlife' | 'Comedy' | 'Community' | 'Tech & Business' | 'Fitness' | 'Family';
export type Borough = 'Manhattan' | 'Brooklyn' | 'Queens' | 'Bronx' | 'Staten Island';

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  source: EventSource;
  borough: Borough;
  timestamp: Date;
  address?: string;
  lat?: number;
  lng?: number;
}

const categories: EventCategory[] = ['Music', 'Arts & Theater', 'Food & Drink', 'Sports', 'Nightlife', 'Comedy', 'Community', 'Tech & Business', 'Fitness', 'Family'];
const sources: EventSource[] = ['Instagram', 'Eventbrite', 'Ticketmaster', 'Meetup', 'Facebook Events'];
const boroughs: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

const eventTitles = [
  'Live Jazz Night', 'Hip Hop Showcase', 'Indie Rock Concert', 'EDM Festival', 'Classical Symphony',
  'Broadway Show', 'Art Gallery Opening', 'Modern Dance', 'Opera Night', 'Poetry Slam',
  'Food Truck Festival', 'Wine Tasting', 'Craft Beer Night', 'Restaurant Week', 'Cooking Class',
  'Knicks Game', 'Yankees Game', 'Basketball Tournament', 'Yoga in the Park', 'Marathon',
  'Rooftop Party', 'Club Night', 'Speakeasy Experience', 'DJ Set', 'Late Night Dance',
  'Comedy Club Night', 'Stand-up Showcase', 'Improv Comedy', 'Roast Battle', 'Variety Show',
  'Neighborhood Meetup', 'Block Party', 'Volunteer Day', 'Cultural Festival', 'Street Fair',
  'Startup Pitch Night', 'Tech Meetup', 'Hackathon', 'Product Launch', 'Networking Event',
  'CrossFit Session', 'Running Club', 'Spin Class', 'Boxing Workout', 'HIIT Training',
  'Kids Workshop', 'Family Movie Night', 'Museum Day', 'Puppet Show', 'Story Time',
  'Sunset Rooftop Sessions', 'Underground House Party', 'Karaoke Night', 'Trivia Competition', 'Open Mic Night',
  'Jazz Brunch', 'Soul Food Sunday', 'Taco Tuesday', 'Whiskey Wednesday', 'Throwback Thursday',
  'Latin Dance Party', 'Salsa Night', 'Bachata Lessons', 'Merengue Fest', 'Reggaeton Bash',
  'Acoustic Session', 'Battle of the Bands', 'Songwriter Circle', 'Record Release Party', 'Album Listening Event',
  'Fashion Week Showcase', 'Designer Pop-Up', 'Vintage Market', 'Flea Market Sunday', 'Artisan Fair',
  'Photography Walk', 'Film Screening', 'Documentary Night', 'Short Film Festival', 'Animation Showcase',
  'Board Game Night', 'Dungeons & Dragons', 'Video Game Tournament', 'Esports Viewing Party', 'Retro Gaming',
  'Book Club Meeting', 'Author Q&A', 'Literary Reading', 'Writing Workshop', 'Bookstore Event',
  'Meditation Circle', 'Sound Bath', 'Breathwork Session', 'Wellness Workshop', 'Holistic Healing',
  'Farmers Market', 'Organic Market', 'Cheese Tasting', 'Chocolate Workshop', 'Coffee Cupping',
  'Mets Game', 'Nets Game', 'Rangers Game', 'Soccer Match', 'Rugby Tournament',
  'Pilates Class', 'Barre Workout', 'Zumba Party', 'Dance Fitness', 'Aerial Yoga',
  'Science Fair', 'STEM Workshop', 'Robotics Demo', 'Space Talk', 'Nature Walk',
  'Drag Show', 'Burlesque Night', 'Cabaret Show', 'Musical Theater', 'Opera Workshop',
  'Graffiti Tour', 'Street Art Walk', 'Mural Painting', 'Public Art Unveiling', 'Sculpture Garden',
  'Craft Workshop', 'Pottery Class', 'Painting Session', 'Drawing Circle', 'Digital Art Demo',
  'Startup Demo Day', 'VC Pitch Event', 'Innovation Summit', 'Blockchain Talk', 'AI Workshop',
  'Fundraiser Gala', 'Charity Auction', 'Community Cleanup', 'Food Drive', 'Donation Event',
  'Pet Adoption Fair', 'Dog Park Meetup', 'Cat Cafe Event', 'Animal Rescue', 'Pet Costume Party',
  'Pride Parade', 'LGBTQ+ Mixer', 'Queer Art Show', 'Rainbow Festival', 'Community Pride',
  'Carnival', 'Parade', 'Fireworks Show', 'Holiday Market', 'Winter Festival',
  'Spring Fling', 'Summer Jam', 'Fall Harvest', 'Thanksgiving Potluck', 'New Years Eve Bash',
  'Valentine Dance', 'Halloween Party', 'Costume Contest', 'Masquerade Ball', 'Theme Party',
  'BBQ Cookout', 'Picnic in the Park', 'Beach Party', 'Pool Party', 'Garden Party',
  'Sunrise Yoga', 'Moonlight Meditation', 'Dawn Run', 'Twilight Walk', 'Stargazing Night'
];

// Borough coordinate ranges for realistic random coordinates
const boroughCoordinates: Record<Borough, { latRange: [number, number], lngRange: [number, number] }> = {
  'Manhattan': { latRange: [40.7000, 40.8500], lngRange: [-74.0200, -73.9300] },
  'Brooklyn': { latRange: [40.5700, 40.7400], lngRange: [-74.0500, -73.8500] },
  'Queens': { latRange: [40.6000, 40.8000], lngRange: [-73.9500, -73.7000] },
  'Bronx': { latRange: [40.7900, 40.9200], lngRange: [-73.9300, -73.7500] },
  'Staten Island': { latRange: [40.5000, 40.6500], lngRange: [-74.2500, -74.0500] }
};

// Helper function to generate random coordinates within a borough
function getRandomCoordinates(borough: Borough): { lat: number, lng: number } {
  const { latRange, lngRange } = boroughCoordinates[borough];
  const lat = latRange[0] + Math.random() * (latRange[1] - latRange[0]);
  const lng = lngRange[0] + Math.random() * (lngRange[1] - lngRange[0]);
  return { lat, lng };
}

// Generate a random street name
function getRandomStreetName(): string {
  const streets = [
    'Broadway', 'Park Ave', '5th Avenue', 'Madison Ave', 'Lexington Ave', '3rd Avenue', 
    'Amsterdam Ave', 'Columbus Ave', 'West End Ave', 'Riverside Dr', 'Central Park West',
    'Bedford Ave', 'Flatbush Ave', 'Atlantic Ave', 'Fulton St', 'DeKalb Ave', 'Myrtle Ave',
    'Queens Blvd', 'Roosevelt Ave', 'Northern Blvd', 'Astoria Blvd', 'Steinway St',
    'Grand Concourse', 'Fordham Rd', 'Jerome Ave', 'Webster Ave', 'White Plains Rd',
    'Victory Blvd', 'Forest Ave', 'Bay St', 'Richmond Ave', 'Hylan Blvd'
  ];
  return streets[Math.floor(Math.random() * streets.length)];
}

// Generate larger dataset with more randomness
function generateSampleEvents(): Event[] {
  const events: Event[] = [];
  const now = new Date();
  const totalEvents = 1500; // Increased from 300 to 1500
  
  for (let i = 0; i < totalEvents; i++) {
    // More random date distribution across 100 days
    // Some days will have many events, some will have few
    const daysOffset = Math.floor(Math.random() * 100); // Fully random day selection
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() + daysOffset);
    dayStart.setHours(0, 0, 0, 0);
    
    // Random time within the day with bias towards evening/night
    const timeOfDayRandom = Math.random();
    let randomHours;
    if (timeOfDayRandom < 0.1) {
      // 10% early morning (6am-9am)
      randomHours = 6 + Math.random() * 3;
    } else if (timeOfDayRandom < 0.3) {
      // 20% midday (10am-2pm)
      randomHours = 10 + Math.random() * 4;
    } else if (timeOfDayRandom < 0.5) {
      // 20% afternoon (3pm-5pm)
      randomHours = 15 + Math.random() * 2;
    } else if (timeOfDayRandom < 0.85) {
      // 35% evening (6pm-10pm) - peak time
      randomHours = 18 + Math.random() * 4;
    } else {
      // 15% late night (11pm-2am)
      randomHours = 23 + Math.random() * 3;
    }
    
    const randomMinutes = Math.floor(Math.random() * 60);
    const timestamp = new Date(dayStart.getTime() + (randomHours * 60 * 60 * 1000) + (randomMinutes * 60 * 1000));
    
    // Slightly bias certain categories to be more common
    const categoryRandom = Math.random();
    let category: EventCategory;
    if (categoryRandom < 0.15) category = 'Music'; // 15% Music
    else if (categoryRandom < 0.28) category = 'Food & Drink'; // 13% Food
    else if (categoryRandom < 0.40) category = 'Nightlife'; // 12% Nightlife
    else if (categoryRandom < 0.50) category = 'Community'; // 10% Community
    else if (categoryRandom < 0.60) category = 'Arts & Theater'; // 10% Arts
    else category = categories[Math.floor(Math.random() * categories.length)]; // Rest random
    
    // Borough distribution - Manhattan and Brooklyn slightly more common
    const boroughRandom = Math.random();
    let borough: Borough;
    if (boroughRandom < 0.30) borough = 'Manhattan'; // 30%
    else if (boroughRandom < 0.55) borough = 'Brooklyn'; // 25%
    else if (boroughRandom < 0.75) borough = 'Queens'; // 20%
    else if (boroughRandom < 0.90) borough = 'Bronx'; // 15%
    else borough = 'Staten Island'; // 10%
    
    const source = sources[Math.floor(Math.random() * sources.length)];
    const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    const { lat, lng } = getRandomCoordinates(borough);
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetName = getRandomStreetName();
    
    events.push({
      id: `event-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      category: category,
      source: source,
      borough: borough,
      timestamp: timestamp,
      address: `${streetNumber} ${streetName}, ${borough}, NY`,
      lat: lat,
      lng: lng
    });
  }
  
  // Sort by timestamp
  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// Export the sample events
export const SAMPLE_EVENTS = generateSampleEvents();

// Export constants
export const CATEGORIES = categories;
export const BOROUGHS = boroughs;
export const SOURCES = sources;