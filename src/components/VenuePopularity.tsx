import { useMemo } from 'react';
import { Event } from '../utils/eventData';
import { MapPin, TrendingUp } from 'lucide-react';
import { Badge } from './ui/badge';

interface VenuePopularityProps {
  events: Event[];
}

export function VenuePopularity({ events }: VenuePopularityProps) {
  const venueData = useMemo(() => {
    const venueCounts: Record<string, { count: number; borough: string }> = {};
    
    events.forEach(event => {
      if (!venueCounts[event.venue]) {
        venueCounts[event.venue] = { count: 0, borough: event.borough };
      }
      venueCounts[event.venue].count++;
    });
    
    return Object.entries(venueCounts)
      .map(([venue, data]) => ({ venue, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 venues
  }, [events]);
  
  const topVenue = venueData[0];

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Top Venues</h3>
      </div>
      
      {topVenue && (
        <div className="bg-[#FF8C42]/10 border border-[#FF8C42]/30 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[--text-secondary]">Hottest Venue</p>
              <p className="mt-1 text-foreground font-bold">{topVenue.venue}</p>
              <p className="text-sm text-[--text-secondary] mt-1">{topVenue.borough}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl text-[--nyc-orange] font-bold">{topVenue.count}</p>
              <p className="text-xs text-[--text-secondary] font-bold">events</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {venueData.map((venue, index) => (
          <div 
            key={venue.venue}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#004953] text-white text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <p className="text-foreground font-bold">{venue.venue}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {venue.borough}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-foreground font-bold">{venue.count}</p>
              <p className="text-xs text-[--text-secondary]">events</p>
            </div>
          </div>
        ))}
      </div>
      
      {venueData.length === 0 && (
        <div className="text-center py-8 text-[--text-secondary]">
          <p>No venue data available</p>
        </div>
      )}
    </div>
  );
}
