import { Event, EventCategory, EventSource, Borough } from './eventData';
import { geocodeNYCAddress, getBoroughFromAddress } from './geocoding';

// GitHub raw file URL
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/ek4536/Nycliveevents/main/all_events_complete_cleaned.json';

interface GitHubEventData {
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
  [key: string]: any;
}

// Category mapping to match the app's categories
const categoryMapping: Record<string, EventCategory> = {
  'music': 'Music',
  'concert': 'Music',
  'live music': 'Music',
  'performance': 'Music',
  'arts': 'Arts & Theater',
  'theater': 'Arts & Theater',
  'theatre': 'Arts & Theater',
  'art': 'Arts & Theater',
  'gallery': 'Arts & Theater',
  'exhibition': 'Arts & Theater',
  'museum': 'Arts & Theater',
  'food': 'Food & Drink',
  'drink': 'Food & Drink',
  'dining': 'Food & Drink',
  'restaurant': 'Food & Drink',
  'food truck': 'Food & Drink',
  'culinary': 'Food & Drink',
  'sports': 'Sports',
  'game': 'Sports',
  'athletic': 'Sports',
  'nightlife': 'Nightlife',
  'party': 'Nightlife',
  'club': 'Nightlife',
  'bar': 'Nightlife',
  'comedy': 'Comedy',
  'stand-up': 'Comedy',
  'improv': 'Comedy',
  'community': 'Community',
  'festival': 'Community',
  'market': 'Community',
  'fair': 'Community',
  'nature': 'Community',
  'outdoor': 'Community',
  'tech': 'Tech & Business',
  'business': 'Tech & Business',
  'startup': 'Tech & Business',
  'networking': 'Tech & Business',
  'conference': 'Tech & Business',
  'fitness': 'Fitness',
  'yoga': 'Fitness',
  'workout': 'Fitness',
  'gym': 'Fitness',
  'wellness': 'Fitness',
  'family': 'Family',
  'kids': 'Family',
  'children': 'Family',
  'education': 'Family'
};

// Generate random sources for variety
const sources: EventSource[] = ['Instagram', 'Eventbrite', 'Ticketmaster', 'Facebook Events', 'Meetup'];

/**
 * Normalize category from GitHub data
 */
function normalizeCategory(rawCategory: string, title: string): EventCategory {
  const lower = rawCategory.toLowerCase();
  
  // Direct match
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (lower === key || lower.includes(key)) {
      return value;
    }
  }
  
  // Try to infer from title
  const titleLower = title.toLowerCase();
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (titleLower.includes(key)) {
      return value;
    }
  }
  
  return 'Community'; // Default category
}

/**
 * Parse date from "November 28, 2025" format
 */
function parseDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  
  if (!isNaN(parsed.getTime())) {
    // Add random time during the day for variety
    const hours = Math.floor(Math.random() * 14) + 9; // 9 AM to 11 PM
    const minutes = Math.floor(Math.random() * 60);
    parsed.setHours(hours, minutes, 0, 0);
    return parsed;
  }
  
  // Fallback to current date with random time
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
}

/**
 * Extract venue name from location
 */
function extractVenue(location: string, title: string): string {
  // Try to get venue from title (before comma or "at")
  const atMatch = title.match(/at\s+(.+)/i);
  if (atMatch) {
    return atMatch[1].trim();
  }
  
  // Use first part of location (usually the venue/park name)
  const parts = location.split(',');
  return parts[0].trim();
}

/**
 * Enhance location for better geocoding
 */
function enhanceLocation(location: string): string {
  // If location already has full address format, return as is
  if (/\d+\s+\w+/.test(location)) {
    return location;
  }
  
  // For locations without street numbers, try to use the main venue name
  const parts = location.split(',');
  if (parts.length > 0) {
    const venueName = parts[0].trim();
    const borough = extractBoroughFromLocation(location);
    
    if (borough) {
      return `${venueName}, ${borough}, NY`;
    }
    
    return `${venueName}, New York, NY`;
  }
  
  return location;
}

/**
 * Extract borough from location string
 */
function extractBoroughFromLocation(location: string): string | null {
  const lower = location.toLowerCase();
  
  if (lower.includes('manhattan') || lower.includes('new york, ny')) {
    return 'Manhattan';
  }
  if (lower.includes('brooklyn')) {
    return 'Brooklyn';
  }
  if (lower.includes('queens')) {
    return 'Queens';
  }
  if (lower.includes('bronx')) {
    return 'Bronx';
  }
  if (lower.includes('staten island')) {
    return 'Staten Island';
  }
  
  return null;
}

/**
 * Load events from GitHub JSON file
 */
export async function loadEventsFromGitHub(): Promise<Event[]> {
  try {
    console.log('🔄 Fetching events from GitHub...');
    const response = await fetch(GITHUB_DATA_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const rawData: GitHubEventData[] = await response.json();
    console.log(`📦 Fetched ${rawData.length} raw events from GitHub`);
    
    const events: Event[] = [];
    let skipped = 0;
    
    rawData.forEach((rawEvent, index) => {
      try {
        const title = rawEvent.title || `Event ${index + 1}`;
        const location = rawEvent.location;
        
        // Skip events without location
        if (!location) {
          skipped++;
          return;
        }
        
        // Enhance location for geocoding
        const enhancedLocation = enhanceLocation(location);
        
        // Try to geocode the address
        const coords = geocodeNYCAddress(enhancedLocation);
        if (!coords) {
          skipped++;
          return;
        }
        
        // Determine borough
        const boroughFromLocation = extractBoroughFromLocation(location);
        const borough = (boroughFromLocation || getBoroughFromAddress(enhancedLocation)) as Borough;
        
        // Parse category
        const category = normalizeCategory(rawEvent.category, title);
        
        // Random source for variety
        const source = sources[Math.floor(Math.random() * sources.length)];
        
        // Parse timestamp from start_date
        const timestamp = parseDate(rawEvent.start_date);
        
        // Extract venue
        const venue = extractVenue(location, title);
        
        // Random price
        const priceOptions = ['Free', '$15', '$25', '$35', '$50', '$75'];
        const price = priceOptions[Math.floor(Math.random() * priceOptions.length)];
        
        // Random attendees
        const attendees = Math.floor(Math.random() * 500) + 10;
        
        // Create event
        events.push({
          id: `gh_evt_${index}`,
          title,
          category,
          source,
          borough,
          venue,
          timestamp,
          address: enhancedLocation,
          lat: coords.lat,
          lng: coords.lng,
          attendees,
          price
        });
      } catch (err) {
        skipped++;
        console.warn(`⚠️ Skipping event ${index}:`, err);
      }
    });
    
    console.log(`✅ Loaded ${events.length} events from GitHub (${skipped} skipped due to geocoding issues)`);
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('❌ Failed to load events from GitHub:', error);
    return [];
  }
}

/**
 * Load events with fallback to local data
 */
export async function loadEventsWithFallback(): Promise<Event[]> {
  const githubEvents = await loadEventsFromGitHub();
  
  if (githubEvents.length > 0) {
    return githubEvents;
  }
  
  // Fallback to local data if GitHub fetch fails
  console.warn('⚠️ Using fallback local data');
  const { loadEventsFromJSON } = await import('./dataLoader');
  return loadEventsFromJSON();
}
