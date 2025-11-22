import { useState } from 'react';
import { Event, Borough } from '../utils/eventData';
import { MapPin } from 'lucide-react';
import nycMapImage from 'figma:asset/67229fccd21d2a8147a0f572fd73b739e4e7229f.png';

interface InteractiveMapViewProps {
  events: Event[];
  selectedBorough: string;
  onBoroughClick: (borough: string) => void;
}

export function InteractiveMapView({ events, selectedBorough, onBoroughClick }: InteractiveMapViewProps) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);

  // Borough coordinates for NYC (percentage positions on the map)
  const boroughPositions: Record<Borough, { top: string; left: string }> = {
    'Manhattan': { top: '42%', left: '52%' },
    'Brooklyn': { top: '58%', left: '60%' },
    'Queens': { top: '35%', left: '70%' },
    'Bronx': { top: '20%', left: '55%' },
    'Staten Island': { top: '75%', left: '35%' }
  };

  // Calculate event counts per borough
  const boroughCounts = events.reduce((acc, event) => {
    acc[event.borough] = (acc[event.borough] || 0) + 1;
    return acc;
  }, {} as Record<Borough, number>);

  return (
    <div className="bg-card border rounded-lg overflow-hidden h-full">
      <div className="flex items-center gap-2 p-4 border-b bg-muted">
        <MapPin className="w-5 h-5 text-foreground" />
        <h3 className="text-foreground font-bold">NYC Event Map</h3>
      </div>
      
      <div className="relative w-full h-[400px] lg:h-[500px] bg-[--nyc-gray]">
        {/* Google Maps Background Image */}
        <img 
          src={nycMapImage}
          alt="NYC Map"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Interactive Markers with Event Counts */}
        {Object.entries(boroughPositions).map(([borough, position]) => {
          const count = boroughCounts[borough as Borough] || 0;
          const isSelected = selectedBorough === borough;
          const isActive = selectedBorough === 'all' || isSelected;
          const isHovered = hoveredBorough === borough;

          return (
            <div
              key={borough}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
              style={{ 
                top: position.top, 
                left: position.left,
                zIndex: isHovered || isSelected ? 20 : 10
              }}
              onClick={() => onBoroughClick(selectedBorough === borough ? 'all' : borough)}
              onMouseEnter={() => setHoveredBorough(borough)}
              onMouseLeave={() => setHoveredBorough(null)}
            >
              {/* Marker Circle */}
              <div
                className={`flex items-center justify-center rounded-full border-4 border-white shadow-lg transition-all ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  width: isSelected ? '48px' : '40px',
                  height: isSelected ? '48px' : '40px',
                  backgroundColor: isSelected ? '#4B5563' : '#9CA3AF',
                  opacity: isActive ? 0.95 : 0.6
                }}
              >
                <span className="text-white font-bold text-sm">{count}</span>
              </div>

              {/* Hover Info Window */}
              {isHovered && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 whitespace-nowrap border-2 border-gray-300 z-30">
                  <div className="font-bold text-sm text-foreground">{borough}</div>
                  <div className="text-xs text-[--text-secondary] font-bold">{count} events</div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-card">
        <p className="text-xs text-[--text-secondary] mb-2">
          <span className="font-bold">Event Distribution Across Boroughs</span>
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[--text-secondary]">Click a borough to filter events</span>
          <span className="text-[--text-secondary] font-bold">
            Total: {events.length}
          </span>
        </div>
      </div>
    </div>
  );
}