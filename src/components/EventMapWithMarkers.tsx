import { useState, useMemo, useCallback } from 'react';
import { Event } from '../utils/eventData';
import { MapPin, ZoomIn, ZoomOut, Maximize2, Clock } from 'lucide-react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface EventMapWithMarkersProps {
  events: Event[];
  selectedBorough: string;
  selectedDayOffset: number;
  onDayOffsetChange: (offset: number) => void;
  onBoroughClick: (borough: string) => void;
}

// Category colors matching the app theme
const categoryColors: Record<string, string> = {
  'Music': '#A8DADC',
  'Arts & Theater': '#C5B4E3',
  'Food & Drink': '#FF6F61',
  'Sports': '#FF9F40',
  'Nightlife': '#9D84B7',
  'Comedy': '#FFB6B9',
  'Community': '#98D8C8',
  'Tech & Business': '#6C757D',
  'Fitness': '#81C784',
  'Family': '#FFD662'
};

// Google Maps API Key - Replace with your actual key
// Get your key at: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = 'AIzaSyAu8BJDZBjZz2B64gkNLuw489QbzyObhD4';

// NYC center coordinates
const nycCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export function EventMapWithMarkers({ events, selectedBorough, selectedDayOffset, onDayOffsetChange, onBoroughClick }: EventMapWithMarkersProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(11);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Filter events that have coordinates
  const eventsWithCoords = useMemo(() => {
    return events.filter(event => event.lat && event.lng);
  }, [events]);

  // Group nearby events to prevent marker overlap
  const groupedEvents = useMemo(() => {
    const groups: { events: Event[]; lat: number; lng: number }[] = [];
    const threshold = 0.002; // Distance threshold for grouping

    eventsWithCoords.forEach(event => {
      if (!event.lat || !event.lng) return;

      // Find existing group nearby
      const nearbyGroup = groups.find(group => {
        const distance = Math.sqrt(
          Math.pow(group.lat - event.lat!, 2) + Math.pow(group.lng - event.lng!, 2)
        );
        return distance < threshold;
      });

      if (nearbyGroup) {
        nearbyGroup.events.push(event);
      } else {
        groups.push({
          events: [event],
          lat: event.lat,
          lng: event.lng
        });
      }
    });

    return groups;
  }, [eventsWithCoords]);

  // Zoom controls
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 11;
      map.setZoom(currentZoom + 1);
      setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 11;
      map.setZoom(currentZoom - 1);
      setZoom(currentZoom - 1);
    }
  };

  const handleResetZoom = () => {
    if (map) {
      map.setCenter(nycCenter);
      map.setZoom(11);
      setZoom(11);
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsMapLoaded(true);
  }, []);

  const onZoomChanged = () => {
    if (map) {
      const currentZoom = map.getZoom() || 11;
      setZoom(currentZoom);
    }
  };

  // Create custom marker icon with category color
  const createMarkerIcon = useCallback((color: string, count?: number) => {
    if (!isMapLoaded || typeof google === 'undefined') return undefined;
    
    const svg = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#shadow)">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
          <path d="M16 30 L11 20 L21 20 Z" fill="${color}"/>
        </g>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        ${count ? `<text x="16" y="21" text-anchor="middle" font-size="10" font-weight="bold" fill="white">${count}</text>` : ''}
      </svg>
    `;
    
    return {
      url: `data:image/svg+xml;base64,${btoa(svg)}`,
      scaledSize: new google.maps.Size(24, 32),
      anchor: new google.maps.Point(12, 32)
    };
  }, [isMapLoaded]);

  // Format date for display
  const formatDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const year = date.getFullYear();
    return `${month} ${day} (${weekday}), ${year}`;
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden h-full">
      <div className="flex items-center gap-2 p-4 border-b bg-muted">
        <MapPin className="w-5 h-5 text-foreground" />
        <h3 className="text-foreground font-bold">NYC Event Map</h3>
        <span className="ml-auto text-xs text-[--text-secondary] font-bold">
          {eventsWithCoords.length} events with locations
        </span>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 ml-2 border-l pl-2">
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Date Slider */}
      <div className="px-4 py-3 bg-card border-b">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[--text-secondary] whitespace-nowrap">Today</span>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedDayOffset}
            onChange={(e) => onDayOffsetChange(Number(e.target.value))}
            className="flex-1 h-1 bg-muted rounded appearance-none cursor-pointer"
          />
          <span className="text-sm text-[--text-secondary] whitespace-nowrap">+100 days</span>
          <span className="text-sm font-bold text-[--midnight-green] min-w-[160px] text-right">
            {formatDate(selectedDayOffset)}
          </span>
        </div>
      </div>
      
      <div className="relative w-full h-[400px] lg:h-[500px] bg-[--nyc-gray]">
        {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' ? (
          <div className="flex items-center justify-center h-full bg-gray-100 p-8">
            <div className="text-center max-w-md">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">Google Maps API Key Required</h3>
              <p className="text-sm text-[--text-secondary] mb-4">
                To view the interactive map, you need to add a Google Maps API key.
              </p>
              <ol className="text-xs text-left text-[--text-secondary] space-y-2 bg-white p-4 rounded border">
                <li className="font-bold">1. Visit Google Cloud Console</li>
                <li>2. Enable "Maps JavaScript API"</li>
                <li>3. Create an API key</li>
                <li>4. Replace GOOGLE_MAPS_API_KEY in EventMapWithMarkers.tsx</li>
              </ol>
              <a 
                href="https://console.cloud.google.com/google/maps-apis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 text-xs text-[--nyc-orange] hover:underline font-bold"
              >
                Get API Key →
              </a>
            </div>
          </div>
        ) : (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={nycCenter}
              zoom={11}
              options={mapOptions}
              onLoad={onLoad}
              onZoomChanged={onZoomChanged}
            >
              {/* Event Markers */}
              {isMapLoaded && groupedEvents.map((group, idx) => {
                const event = group.events[0];
                const markerColor = categoryColors[event.category] || '#6C757D';
                const isMultiple = group.events.length > 1;
                const icon = createMarkerIcon(markerColor, isMultiple ? group.events.length : undefined);

                return (
                  <Marker
                    key={`marker-${idx}`}
                    position={{ lat: group.lat, lng: group.lng }}
                    icon={icon}
                    onClick={() => setSelectedEvent(event)}
                  />
                );
              })}

              {/* Info Window */}
              {selectedEvent && selectedEvent.lat && selectedEvent.lng && (
                <InfoWindow
                  position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                  onCloseClick={() => setSelectedEvent(null)}
                >
                  <div className="p-2 max-w-[250px]">
                    <p className="font-bold text-foreground mb-1">{selectedEvent.title}</p>
                    <p className="text-xs text-[--text-secondary] mb-1">{selectedEvent.address}</p>
                    <p className="text-xs text-[--text-secondary]">
                      {selectedEvent.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[--text-secondary]">
            <span className="font-bold">Event Locations Across NYC • Zoom: {zoom}</span>
          </p>
          <button
            onClick={() => onBoroughClick('all')}
            className="text-xs text-[--nyc-orange] hover:underline font-bold"
          >
            Reset View
          </button>
        </div>
        
        {/* Category Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[--text-secondary]">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
