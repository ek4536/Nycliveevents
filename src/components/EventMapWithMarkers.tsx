import { useState, useMemo, useEffect, useRef } from 'react';
import { Event } from '../utils/eventData';
import { MapPin, Map } from 'lucide-react';

interface EventMapWithMarkersProps {
  events: Event[];
  selectedBorough: string;
  selectedDayOffset: number;
  onDayOffsetChange: (offset: number) => void;
  onBoroughClick: (borough: string) => void;
}

// Category colors matching the app theme
const categoryColors: Record<string, string> = {
  'Music': '#74D2F2',
  'Arts & Theater': '#80E9A1',
  'Food & Drink': '#F2A059',
  'Sports': '#F7EA37',
  'Nightlife': '#B188F0',
  'Comedy': '#FFB174',
  'Community': '#6EE441',
  'Tech & Business': '#F2D759',
  'Fitness': '#8AAEF7',
  'Family': '#8AAF99'
};

// Borough coordinates for NYC
const boroughCoordinates: Record<string, { lat: number; lng: number }> = {
  'Manhattan': { lat: 40.7831, lng: -73.9712 },
  'Brooklyn': { lat: 40.6782, lng: -73.9442 },
  'Queens': { lat: 40.7282, lng: -73.7949 },
  'Bronx': { lat: 40.8448, lng: -73.8648 },
  'Staten Island': { lat: 40.5795, lng: -74.1502 }
};

// ✅ [보안 수정 1] 하드코딩된 키 삭제. 오직 환경변수만 바라보게 설정
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function EventMapWithMarkers({ events, selectedBorough, selectedDayOffset, onDayOffsetChange, onBoroughClick }: EventMapWithMarkersProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    return counts;
  }, [events]);

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

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // 이미 로드되었으면 중단
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      // ⚠️ Check if script is already loading (prevent duplicates)
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      // ✅ [보안 수정 2] API 키가 없으면 스크립트 로드 중단 및 경고
      if (!GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API Key가 없습니다! .env 파일을 확인해주세요.");
        return;
      }

      const script = document.createElement('script');
      // ✅ Use environment variable with places library
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps loaded successfully');
        setIsMapLoaded(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps:', error);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || googleMapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -73.9060 }, // NYC center
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    googleMapRef.current = map;
  }, [isMapLoaded]);

  // Update markers when events change
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for each event
    events.forEach(event => {
      // Use event's lat/lng if available, otherwise use borough coordinates with random offset
      let lat: number;
      let lng: number;
      
      if (event.lat && event.lng) {
        lat = event.lat;
        lng = event.lng;
      } else {
        const baseCoords = boroughCoordinates[event.borough];
        lat = baseCoords.lat + (Math.random() - 0.5) * 0.1;
        lng = baseCoords.lng + (Math.random() - 0.5) * 0.1;
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: googleMapRef.current,
        title: event.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: categoryColors[event.category] || '#999',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #004953;">${event.title}</h4>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              <strong>Category:</strong> ${event.category}<br/>
              <strong>Borough:</strong> ${event.borough}<br/>
              <strong>Time:</strong> ${event.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [events]);

  const totalEvents = events.length;

  return (
    <div className="bg-card border rounded-lg overflow-hidden h-full">
      <div className="flex items-center gap-2 p-4 border-b bg-muted">
        <Map className="w-5 h-5 text-foreground" />
        <h3 className="text-foreground font-bold">NYC Event Map</h3>
        <span className="ml-auto text-xs text-[--text-secondary] font-bold">
          {totalEvents} total events
        </span>
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
      
      {/* Google Map */}
      <div 
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100"
        style={{ minHeight: '500px' }}
      >
        {!isMapLoaded && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[--text-secondary]">Loading map...</p>
          </div>
        )}
      </div>

      {/* Category Legend with Counts */}
      <div className="p-4 bg-card border-t">
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryColors).map(([category, color]) => {
            const count = categoryCounts[category] || 0;
            return (
              <div key={category} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-[--text-secondary]">{category}</span>
                <span className="text-xs font-bold text-[--nyc-orange]">({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
