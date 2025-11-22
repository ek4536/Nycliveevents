import { useEffect, useRef } from 'react';
import { Event, Borough } from '../utils/eventData';
import { MapPin } from 'lucide-react';

interface GoogleMapViewProps {
  events: Event[];
  selectedBorough: string;
  onBoroughClick: (borough: string) => void;
}

export function GoogleMapView({ events, selectedBorough, onBoroughClick }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Borough coordinates for NYC
  const boroughCoords: Record<Borough, { lat: number; lng: number }> = {
    'Manhattan': { lat: 40.7831, lng: -73.9712 },
    'Brooklyn': { lat: 40.6782, lng: -73.9442 },
    'Queens': { lat: 40.7282, lng: -73.7949 },
    'Bronx': { lat: 40.8448, lng: -73.8648 },
    'Staten Island': { lat: 40.5795, lng: -74.1502 }
  };

  // Calculate event counts per borough
  const boroughCounts = events.reduce((acc, event) => {
    acc[event.borough] = (acc[event.borough] || 0) + 1;
    return acc;
  }, {} as Record<Borough, number>);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Google Map
    const initMap = () => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 40.7128, lng: -73.9060 }, // NYC center
        zoom: 10,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#FFF8F0' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#C5E8F2' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Add markers for each borough
      Object.entries(boroughCoords).forEach(([borough, coords]) => {
        const count = boroughCounts[borough as Borough] || 0;
        const isSelected = selectedBorough === borough;
        const isActive = selectedBorough === 'all' || isSelected;

        // Create custom marker with event count
        const marker = new google.maps.Marker({
          position: coords,
          map: map,
          title: borough,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 20 : 15,
            fillColor: isActive ? '#FF6B35' : '#CCCCCC',
            fillOpacity: isActive ? 0.9 : 0.5,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          label: {
            text: count.toString(),
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 'bold'
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          onBoroughClick(selectedBorough === borough ? 'all' : borough);
        });

        // Add info window with borough name on hover
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px; font-weight: bold; color: #1A1A1A;">
                      <div style="font-size: 16px; margin-bottom: 4px;">${borough}</div>
                      <div style="font-size: 14px; color: #FF6B35;">${count} events</div>
                    </div>`
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });
      });
    };

    // Load Google Maps API
    if (typeof google !== 'undefined' && google.maps) {
      initMap();
    } else {
      // Dynamically load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [events, selectedBorough, onBoroughClick]);

  return (
    <div className="bg-white border rounded-lg overflow-hidden h-full">
      <div className="flex items-center gap-2 p-4 border-b bg-gradient-to-r from-[--nyc-orange] to-[--nyc-yellow]">
        <MapPin className="w-5 h-5 text-white" />
        <h3 className="text-white">NYC Event Map</h3>
      </div>
      
      <div className="relative w-full h-[400px] lg:h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Fallback/loading state - shows borough map */}
        {!mapInstanceRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-[--nyc-gray]">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-[--nyc-orange] animate-pulse" />
              <p className="text-sm text-[--text-secondary]">Loading NYC Map...</p>
              <p className="text-xs text-[--text-secondary] mt-2">
                Note: Replace YOUR_API_KEY_HERE with your Google Maps API key
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-white">
        <p className="text-xs text-[--text-secondary] mb-2">
          <span className="font-bold">Event Distribution</span>
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[--text-secondary]">Click a marker to filter</span>
          <span className="text-[--nyc-orange] font-bold">
            Total: {events.length}
          </span>
        </div>
      </div>
    </div>
  );
}
