import { useState, useEffect } from 'react';
import { Event, generateHistoricalData, EventCategory, Borough } from './utils/eventData';
import { LiveEventFeed } from './components/LiveEventFeed';
import { TrendsChart } from './components/TrendsChart';
import { FilterPanel } from './components/FilterPanel';
import { Logo } from './components/Logo';
import { InteractiveMapView } from './components/InteractiveMapView';
import { Radio, TrendingUp } from 'lucide-react';

export default function App() {
  const [historicalEvents, setHistoricalEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBorough, setSelectedBorough] = useState<string>('all');

  useEffect(() => {
    // Generate historical data for analytics
    const events = generateHistoricalData(24);
    setHistoricalEvents(events);
  }, []);

  const filteredHistoricalEvents = historicalEvents.filter(event => {
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    if (selectedBorough !== 'all' && event.borough !== selectedBorough) return false;
    return true;
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBorough('all');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#004953] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="pl-2">
            <Logo className="text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Map View - 50% on desktop (5/10), full width on mobile */}
          <div className="lg:col-span-5">
            <InteractiveMapView 
              events={filteredHistoricalEvents}
              selectedBorough={selectedBorough}
              onBoroughClick={setSelectedBorough}
            />
          </div>

          {/* Live Feed - 50% on desktop (5/10), full width on mobile */}
          <div className="lg:col-span-5 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-6">
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

            {/* Live Feed */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-[--nyc-orange]" />
                <h3 className="font-bold text-foreground">Live Event Feed</h3>
              </div>
              <LiveEventFeed 
                filter={{
                  category: selectedCategory !== 'all' ? (selectedCategory as EventCategory) : undefined,
                  borough: selectedBorough !== 'all' ? (selectedBorough as Borough) : undefined
                }}
              />
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
      </main>

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