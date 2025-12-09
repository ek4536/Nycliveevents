import { Event } from './eventData';

// ✅ Use environment variable for API URL with proper fallback
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://192.168.1.116:8000';

// Enable/disable API error logging for prototype mode
const ENABLE_API_LOGGING = false; // Set to true when you want to debug API issues

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
      // Add timeout to fail faster
      signal: AbortSignal.timeout(3000) // 3 second timeout
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
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(item.date || item.created_at || Date.now()),
      address: item.address || item.location?.address || undefined,
      lat: item.lat || item.latitude || item.location?.lat || undefined,
      lng: item.lng || item.longitude || item.location?.lng || undefined,
    }));
  } catch (error) {
    // Only log errors if explicitly enabled (for debugging)
    if (ENABLE_API_LOGGING) {
      console.error('Error fetching events from API:', error);
    }
    throw error;
  }
}

/**
 * Fetches events from API with fallback to local data
 */
export async function loadEventsWithAPIFallback(): Promise<Event[]> {
  try {
    if (ENABLE_API_LOGGING) {
      console.log('Attempting to fetch events from API...');
    }
    const events = await loadEventsFromAPI();
    if (ENABLE_API_LOGGING || events.length > 0) {
      console.log(`✅ Successfully loaded ${events.length} events from API`);
    }
    return events;
  } catch (error) {
    // Silently fallback to sample data in prototype mode
    if (ENABLE_API_LOGGING) {
      console.warn('API unavailable, using sample data for prototype:', error);
    }
    // Return empty array - the app will use SAMPLE_EVENTS
    return [];
  }
}