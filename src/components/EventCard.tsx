import { Event } from '../utils/eventData';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface EventCardProps {
  event: Event;
  isNew?: boolean;
}

const sourceColors: Record<string, string> = {
  'Instagram': 'bg-[--nyc-yellow]/10 text-[--nyc-orange] border-[--nyc-orange]',
  'Eventbrite': 'bg-[--nyc-orange]/10 text-[--nyc-orange-dark] border-[--nyc-orange]',
  'Ticketmaster': 'bg-[--nyc-yellow]/20 text-[--nyc-orange-dark] border-[--nyc-yellow]',
  'Meetup': 'bg-[--nyc-orange]/15 text-[--nyc-orange-dark] border-[--nyc-orange]',
  'Facebook Events': 'bg-[--nyc-yellow]/15 text-[--nyc-orange-dark] border-[--nyc-yellow]'
};

const categoryColors: Record<string, string> = {
  'Music': 'bg-[#74D2F2] text-black',
  'Arts & Theater': 'bg-[#80E9A1] text-black',
  'Food & Drink': 'bg-[#F2A059] text-black',
  'Sports': 'bg-[#F7EA37] text-black',
  'Nightlife': 'bg-[#B188F0] text-black',
  'Comedy': 'bg-[#FFB174] text-black',
  'Community': 'bg-[#6EE441] text-black',
  'Tech & Business': 'bg-[#F2D759] text-black',
  'Fitness': 'bg-[#8AAEF7] text-black',
  'Family': 'bg-[#8AAF99] text-black'
};

export function EventCard({ event, isNew = false }: EventCardProps) {
  const formatEventDateTime = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${month} ${day} (${weekday}), ${time}`;
  };

  return (
    <Card className={`p-4 transition-all duration-300 ${isNew ? 'animate-in slide-in-from-top-2 bg-[--nyc-orange]/5 border-[--nyc-orange]' : ''}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-[--text] font-bold">{event.title}</h3>
            <p className="text-[--text-secondary] text-sm mt-1">{event.venue}</p>
          </div>
          <Badge className={sourceColors[event.source] || 'bg-gray-100 text-gray-700'} variant="outline">
            {event.source}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={`${categoryColors[event.category] || 'bg-gray-100'} font-bold`}>
            {event.category}
          </Badge>
          
          <div className="flex items-center gap-1 text-sm text-[--text-secondary]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-bold">{event.borough}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[--text-secondary]">
          <Clock className="w-3 h-3" />
          <span>{formatEventDateTime(event.timestamp)}</span>
        </div>
      </div>
    </Card>
  );
}
