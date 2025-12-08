import { useState, useEffect } from 'react';
import { Event, generateHistoricalData, EventCategory, Borough } from './utils/eventData';
import { loadEventsFromJSON, mergeEventsData } from './utils/dataLoader';
import { loadEventsWithAPIFallback } from './utils/apiLoader';
import { LiveEventFeed } from './components/LiveEventFeed';
import { TrendsChart } from './components/TrendsChart';
import { FilterPanel } from './components/FilterPanel';
import { Logo } from './components/Logo';
import { EventMapWithMarkers } from './components/EventMapWithMarkers';
import { TimeOfDayAnalytics } from './components/TimeOfDayAnalytics';
import { VenuePopularity } from './components/VenuePopularity';
import { ActivityHeatmap } from './components/ActivityHeatmap';

import { Radio, TrendingUp, Calendar, Loader2, BarChart3 } from 'lucide-react';

const categories: EventCategory[] = ['Music', 'Arts & Theater', 'Food & Drink', 'Sports', 'Nightlife', 'Comedy', 'Community', 'Tech & Business', 'Fitness', 'Family'];
const boroughs: Borough[] = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function App() {
  const [historicalEvents, setHistoricalEvents] = useState<Event[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 = today, 100 = 100 days later
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load events from API endpoint
        const apiEvents = await loadEventsWithAPIFallback();
        
        // Generate historical data for analytics if API returns insufficient data
        const generatedEvents = apiEvents.length > 0 ? [] : generateHistoricalData(24);
        
        // Merge both datasets
        const allEvents = apiEvents.length > 0 ? apiEvents : mergeEventsData([], generatedEvents);
        
        setHistoricalEvents(allEvents);
        console.log(`Loaded ${allEvents.length} total events`);
      } catch (error) {
        console.error('Failed to load events:', error);
        // Fallback to generated data only
        const generatedEvents = generateHistoricalData(24);
        setHistoricalEvents(generatedEvents);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Calculate the target date based on slider offset
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + selectedDayOffset);
  targetDate.setHours(0, 0, 0, 0);

  const filteredHistoricalEvents = historicalEvents.filter(event => {
    // Date filtering - use slider date
    const eventDate = new Date(event.timestamp);
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    if (eventDateOnly.getTime() !== targetDate.getTime()) {
      return false;
    }
    
    // Category filtering (multiple selection)
    if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) return false;
    
    // Borough filtering (multiple selection)
    if (selectedBoroughs.length > 0 && !selectedBoroughs.includes(event.borough)) return false;
    
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBoroughs([]);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedDayOffset(0);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBorough = (borough: string) => {
    setSelectedBoroughs(prev => 
      prev.includes(borough) 
        ? prev.filter(b => b !== borough)
        : [...prev, borough]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#004953] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="pl-2">
              <Logo className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[--nyc-orange] animate-spin mx-auto mb-4" />
            <p className="text-foreground font-bold">Loading NYC Events Data...</p>
            <p className="text-sm text-[--text-secondary] mt-2">Fetching from GitHub repository</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Map View - 75% on desktop (9/12), full width on mobile */}
            <div className="lg:col-span-9">
              <EventMapWithMarkers 
                events={filteredHistoricalEvents}
                selectedBorough={selectedBoroughs[0] || 'all'}
                selectedDayOffset={selectedDayOffset}
                onDayOffsetChange={setSelectedDayOffset}
                onBoroughClick={(borough) => {
                  if (borough === 'all') {
                    setSelectedBoroughs([]);
                  } else {
                    toggleBorough(borough);
                  }
                }}
              />
            </div>

            {/* Stats & Filters - 25% on desktop (3/12), full width on mobile */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <p className="text-sm text-[--text-secondary]">Total Events</p>
                  <p className="text-3xl mt-1 text-[--nyc-orange] font-bold">{filteredHistoricalEvents.length}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <p className="text-sm text-[--text-secondary]">Active Now</p>
                  <p className="text-3xl mt-1 text-[--nyc-yellow] font-bold">
                    {filteredHistoricalEvents.filter(e => 
                      new Date().getTime() - e.timestamp.getTime() < 60 * 60 * 1000
                    ).length}
                  </p>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-[#f8f9fa] border-2 border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
                {/* Category Filter - Multi-select with checkboxes */}
                <div>
                  <label className="text-sm text-[--text-secondary] font-bold mb-2 block">
                    Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  </label>
                  <div className="bg-white rounded-lg p-3 border-2 border-gray-200 max-h-[200px] overflow-y-auto space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 text-[--nyc-orange] rounded cursor-pointer"
                        />
                        <span className="text-xs text-[--text] font-bold">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Borough Filter - Multi-select with checkboxes */}
                <div>
                  <label className="text-sm text-[--text-secondary] font-bold mb-2 block">
                    Boroughs {selectedBoroughs.length > 0 && `(${selectedBoroughs.length})`}
                  </label>
                  <div className="bg-white rounded-lg p-3 border-2 border-gray-200 space-y-2">
                    {boroughs.map(borough => (
                      <label key={borough} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedBoroughs.includes(borough)}
                          onChange={() => toggleBorough(borough)}
                          className="w-4 h-4 text-[--nyc-orange] rounded cursor-pointer"
                        />
                        <span className="text-xs text-[--text] font-bold">{borough}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedCategories.length > 0 || selectedBoroughs.length > 0 || selectedDate !== new Date().toISOString().split('T')[0]) && (
                  <button
                    onClick={handleClearFilters}
                    className="w-full text-sm text-[--nyc-orange] font-bold hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Feed & Quick Stats - Below the map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Live Feed - 75% (9/12) */}
            <div className="lg:col-span-9 bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-[--nyc-orange]" />
                <h3 className="font-bold text-foreground">Live Event Feed</h3>
              </div>
              <LiveEventFeed 
                filter={{
                  category: undefined,
                  borough: undefined
                }}
              />
            </div>

            {/* Quick Stats - 25% (3/12) */}
            <div className="lg:col-span-3">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-[--nyc-orange]" />
                  <h3 className="font-bold text-foreground">Quick Stats</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {/* Busiest Borough */}
                  <div className="bg-gradient-to-br from-[#FFED00] to-[#FFD662] text-gray-900 rounded-lg p-4 shadow-md">
                    <p className="text-xs opacity-90 font-bold mb-1">Busiest Borough</p>
                    <p className="text-lg font-bold">
                      {(() => {
                        const boroughCounts = filteredHistoricalEvents.reduce((acc, event) => {
                          acc[event.borough] = (acc[event.borough] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const busiest = Object.entries(boroughCounts).sort((a, b) => b[1] - a[1])[0];
                        return busiest ? busiest[0] : 'N/A';
                      })()}
                    </p>
                    <p className="text-xs mt-1 opacity-75 font-bold">
                      {(() => {
                        const boroughCounts = filteredHistoricalEvents.reduce((acc, event) => {
                          acc[event.borough] = (acc[event.borough] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const busiest = Object.entries(boroughCounts).sort((a, b) => b[1] - a[1])[0];
                        return busiest ? `${busiest[1]} events` : '';
                      })()}
                    </p>
                  </div>

                  {/* Top Category */}
                  <div className="bg-gradient-to-br from-[#A8DADC] to-[#87CEEB] text-gray-900 rounded-lg p-4 shadow-md">
                    <p className="text-xs opacity-90 font-bold mb-1">Top Category</p>
                    <p className="text-lg font-bold">
                      {(() => {
                        const categoryCounts = filteredHistoricalEvents.reduce((acc, event) => {
                          acc[event.category] = (acc[event.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const top = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
                        return top ? top[0] : 'N/A';
                      })()}
                    </p>
                    <p className="text-xs mt-1 opacity-75 font-bold">
                      {(() => {
                        const categoryCounts = filteredHistoricalEvents.reduce((acc, event) => {
                          acc[event.category] = (acc[event.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const top = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
                        return top ? `${top[1]} events` : '';
                      })()}
                    </p>
                  </div>

                  {/* Last 24 Hours */}
                  <div className="bg-gradient-to-br from-[#F4A261] to-[#E76F51] text-white rounded-lg p-4 shadow-md">
                    <p className="text-xs opacity-90 mb-1">Last 24 Hours</p>
                    <p className="text-3xl font-bold">
                      {(() => {
                        const now = new Date();
                        const last24h = filteredHistoricalEvents.filter(e => 
                          now.getTime() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
                        ).length;
                        return last24h;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends Chart - Full width below map and feed */}
          <div className="w-full mt-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-[--nyc-orange]" />
                <h2 className="font-bold text-foreground">Event Trends & Analytics</h2>
              </div>
              <TrendsChart events={filteredHistoricalEvents} />
            </div>
          </div>

          {/* Analytics Grid - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <TimeOfDayAnalytics events={filteredHistoricalEvents} />
            <VenuePopularity events={filteredHistoricalEvents} />
            <ActivityHeatmap events={filteredHistoricalEvents} />
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-card border-t mt-12 py-6">
        <div className="px-4 text-center text-sm text-[--text-secondary]">
          <p className="font-bold">Data aggregated from Instagram, Eventbrite, Ticketmaster, Meetup & Facebook Events</p>
          <p className="mt-1">Live pipeline for continuous data ingestion & analysis</p>
        </div>
      </footer>
    </div>
  );
}
