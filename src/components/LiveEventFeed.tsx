import { useState, useEffect } from 'react';
import { Event, SAMPLE_EVENTS } from '../utils/eventData';
import { EventCard } from './EventCard';
import { Activity } from 'lucide-react';

interface LiveEventFeedProps {
  filter?: {
    category?: string;
    borough?: string;
  };
}

export function LiveEventFeed({ filter }: LiveEventFeedProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventId, setNewEventId] = useState<string | null>(null);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    // Get initial events from sample data
    const initialEvents = SAMPLE_EVENTS.slice(0, 10);
    setEvents(initialEvents);
    setEventIndex(10);

    // Simulate real-time event stream by cycling through sample events
    const interval = setInterval(() => {
      const nextEvent = SAMPLE_EVENTS[eventIndex % SAMPLE_EVENTS.length];
      setEvents(prev => [nextEvent, ...prev].slice(0, 50)); // Keep last 50 events
      setNewEventId(nextEvent.id);
      setEventIndex(prev => prev + 1);
      
      // Remove highlight after animation
      setTimeout(() => setNewEventId(null), 3000);
    }, 3000); // New event every 3 seconds

    return () => clearInterval(interval);
  }, [eventIndex]);

  const filteredEvents = events
    .filter(event => {
      if (filter?.category && event.category !== filter.category) return false;
      if (filter?.borough && event.borough !== filter.borough) return false;
      return true;
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort by time (earliest first)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[--nyc-orange] animate-pulse" />
          <span className="text-sm text-[--text-secondary] font-bold">
            {filteredEvents.length} live events
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-[--text-secondary] py-8">
            No events match your filters
          </p>
        ) : (
          filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isNew={event.id === newEventId}
            />
          ))
        )}
      </div>
    </div>
  );
}