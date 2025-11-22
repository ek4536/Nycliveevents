import { Event, Borough } from '../utils/eventData';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  events: Event[];
  selectedBorough: string;
  onBoroughClick: (borough: string) => void;
}

export function MapView({ events, selectedBorough, onBoroughClick }: MapViewProps) {
  // Calculate event counts per borough
  const boroughCounts = events.reduce((acc, event) => {
    acc[event.borough] = (acc[event.borough] || 0) + 1;
    return acc;
  }, {} as Record<Borough, number>);

  const maxCount = Math.max(...Object.values(boroughCounts), 1);

  const boroughs = [
    { name: 'Manhattan', x: 45, y: 35 },
    { name: 'Brooklyn', x: 60, y: 55 },
    { name: 'Queens', x: 70, y: 30 },
    { name: 'Bronx', x: 50, y: 15 },
    { name: 'Staten Island', x: 25, y: 70 }
  ];

  return (
    <div className="bg-white border rounded-lg p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-[--nyc-cyan]" />
        <h3>NYC Event Map</h3>
      </div>
      
      <div className="relative aspect-square w-full max-w-md mx-auto">
        {/* Background Map */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* NYC Borough Shapes (simplified) */}
          
          {/* Manhattan */}
          <path
            d="M 45 20 L 50 20 L 52 50 L 48 50 Z"
            fill={selectedBorough === 'Manhattan' || selectedBorough === 'all' ? 'var(--nyc-cyan)' : '#E0E0E0'}
            opacity={selectedBorough === 'Manhattan' || selectedBorough === 'all' ? 0.7 : 0.3}
            stroke="var(--nyc-blue-dark)"
            strokeWidth="0.5"
            className="cursor-pointer transition-all hover:opacity-100"
            onClick={() => onBoroughClick(selectedBorough === 'Manhattan' ? 'all' : 'Manhattan')}
          />
          
          {/* Brooklyn */}
          <path
            d="M 52 45 L 68 45 L 70 65 L 55 70 Z"
            fill={selectedBorough === 'Brooklyn' || selectedBorough === 'all' ? 'var(--nyc-cyan)' : '#E0E0E0'}
            opacity={selectedBorough === 'Brooklyn' || selectedBorough === 'all' ? 0.7 : 0.3}
            stroke="var(--nyc-blue-dark)"
            strokeWidth="0.5"
            className="cursor-pointer transition-all hover:opacity-100"
            onClick={() => onBoroughClick(selectedBorough === 'Brooklyn' ? 'all' : 'Brooklyn')}
          />
          
          {/* Queens */}
          <path
            d="M 65 20 L 85 20 L 85 45 L 68 45 Z"
            fill={selectedBorough === 'Queens' || selectedBorough === 'all' ? 'var(--nyc-cyan)' : '#E0E0E0'}
            opacity={selectedBorough === 'Queens' || selectedBorough === 'all' ? 0.7 : 0.3}
            stroke="var(--nyc-blue-dark)"
            strokeWidth="0.5"
            className="cursor-pointer transition-all hover:opacity-100"
            onClick={() => onBoroughClick(selectedBorough === 'Queens' ? 'all' : 'Queens')}
          />
          
          {/* Bronx */}
          <path
            d="M 48 5 L 58 5 L 60 20 L 50 20 Z"
            fill={selectedBorough === 'Bronx' || selectedBorough === 'all' ? 'var(--nyc-cyan)' : '#E0E0E0'}
            opacity={selectedBorough === 'Bronx' || selectedBorough === 'all' ? 0.7 : 0.3}
            stroke="var(--nyc-blue-dark)"
            strokeWidth="0.5"
            className="cursor-pointer transition-all hover:opacity-100"
            onClick={() => onBoroughClick(selectedBorough === 'Bronx' ? 'all' : 'Bronx')}
          />
          
          {/* Staten Island */}
          <path
            d="M 15 65 L 35 65 L 35 82 L 15 82 Z"
            fill={selectedBorough === 'Staten Island' || selectedBorough === 'all' ? 'var(--nyc-cyan)' : '#E0E0E0'}
            opacity={selectedBorough === 'Staten Island' || selectedBorough === 'all' ? 0.7 : 0.3}
            stroke="var(--nyc-blue-dark)"
            strokeWidth="0.5"
            className="cursor-pointer transition-all hover:opacity-100"
            onClick={() => onBoroughClick(selectedBorough === 'Staten Island' ? 'all' : 'Staten Island')}
          />
        </svg>

        {/* Borough labels and counts */}
        {boroughs.map((borough) => {
          const count = boroughCounts[borough.name as Borough] || 0;
          const intensity = count / maxCount;
          
          return (
            <div
              key={borough.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer"
              style={{
                left: `${borough.x}%`,
                top: `${borough.y}%`
              }}
              onClick={() => onBoroughClick(selectedBorough === borough.name ? 'all' : borough.name)}
            >
              <div className={`
                bg-white border-2 rounded-lg px-2 py-1 shadow-md transition-all
                ${selectedBorough === borough.name ? 'border-[--nyc-cyan] scale-110' : 'border-gray-300 hover:border-[--nyc-cyan]'}
              `}>
                <p className="text-xs whitespace-nowrap">{borough.name}</p>
                <p className="text-lg text-[--nyc-blue-dark]">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-[--text-secondary] mb-2">Event Distribution</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[--text-secondary]">Click a borough to filter</span>
          <span className="text-[--nyc-cyan]">
            Total: {events.length}
          </span>
        </div>
      </div>
    </div>
  );
}
