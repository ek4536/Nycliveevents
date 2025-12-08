import { useMemo } from 'react';
import { Event } from '../utils/eventData';
import { BarChart3, MapPin, TrendingUp, Clock } from 'lucide-react';

interface QuickStatsDashboardProps {
  events: Event[];
}

export function QuickStatsDashboard({ events }: QuickStatsDashboardProps) {
  const stats = useMemo(() => {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        busiestBorough: 'N/A',
        busiestBoroughCount: 0,
        topCategory: 'N/A',
        topCategoryCount: 0,
        eventsLast24h: 0
      };
    }
    
    // Find busiest borough
    const boroughCounts: Record<string, number> = {};
    events.forEach(e => {
      boroughCounts[e.borough] = (boroughCounts[e.borough] || 0) + 1;
    });
    const busiestBoroughEntry = Object.entries(boroughCounts).sort(([, a], [, b]) => b - a)[0];
    
    // Find top category
    const categoryCounts: Record<string, number> = {};
    events.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    const topCategoryEntry = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];
    
    // Events in last 24 hours
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const eventsLast24h = events.filter(e => e.timestamp >= last24h).length;
    
    return {
      totalEvents: events.length,
      busiestBorough: busiestBoroughEntry ? busiestBoroughEntry[0] : 'N/A',
      busiestBoroughCount: busiestBoroughEntry ? busiestBoroughEntry[1] : 0,
      topCategory: topCategoryEntry ? topCategoryEntry[0] : 'N/A',
      topCategoryCount: topCategoryEntry ? topCategoryEntry[1] : 0,
      eventsLast24h
    };
  }, [events]);

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Quick Stats Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-gradient-to-br from-[#004953] to-[#026873] text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Total Events</p>
          <p className="text-3xl mt-1 font-bold">{stats.totalEvents}</p>
        </div>
        
        {/* Busiest Borough */}
        <div className="bg-gradient-to-br from-[#FFED00] to-[#FFD662] text-gray-900 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-sm opacity-90 font-bold">Busiest Borough</p>
          <p className="text-lg mt-1 font-bold truncate">{stats.busiestBorough}</p>
          <p className="text-xs mt-1 opacity-75 font-bold">{stats.busiestBoroughCount} events</p>
        </div>
        
        {/* Top Category */}
        <div className="bg-gradient-to-br from-[#A8DADC] to-[#87CEEB] text-gray-900 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-sm opacity-90 font-bold">Top Category</p>
          <p className="text-lg mt-1 font-bold truncate">{stats.topCategory}</p>
          <p className="text-xs mt-1 opacity-75 font-bold">{stats.topCategoryCount} events</p>
        </div>
        
        {/* Events Last 24h */}
        <div className="bg-gradient-to-br from-[#F4A261] to-[#E76F51] text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Last 24 Hours</p>
          <p className="text-3xl mt-1 font-bold">{stats.eventsLast24h}</p>
        </div>
      </div>
    </div>
  );
}