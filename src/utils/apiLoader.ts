import { Event } from './eventData';

const API_BASE_URL = 'http://192.168.1.116:8000';

/**
 * Fetches events from the API endpoint
 */
export async function loadEventsFromAPI(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Map API response to Event interface
    // Assuming the API returns an array of events or an object with an events property
    const events = Array.isArray(data) ? data : (data.events || []);
    
    return events.map((item: any) => ({
      id: item.id || item._id || `${Date.now()}-${Math.random()}`,
      title: item.title || item.name || 'Untitled Event',
      category: item.category || 'Community',
      source: item.source || 'API',
      borough: item.borough || item.location?.borough || 'Manhattan',
      venue: item.venue || item.location?.venue || 'TBA',
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(item.date || item.created_at || Date.now()),
      attendees: item.attendees || item.attendee_count || undefined,
      price: item.price || item.ticket_price || undefined,
      address: item.address || item.location?.address || undefined,
      lat: item.lat || item.latitude || item.location?.lat || undefined,
      lng: item.lng || item.longitude || item.location?.lng || undefined,
    }));
  } catch (error) {
    console.error('Error fetching events from API:', error);
    throw error;
  }
}

/**
 * Fetches events from API with fallback to local data
 */
export async function loadEventsWithAPIFallback(): Promise<Event[]> {
  try {
    console.log('Attempting to fetch events from API...');
    const events = await loadEventsFromAPI();
    console.log(`Successfully loaded ${events.length} events from API`);
    return events;
  } catch (error) {
    console.error('Failed to load from API, using fallback data:', error);
    // Return empty array - the app will merge with generated data
    return [];
  }
}
