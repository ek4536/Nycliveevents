import { useMemo } from 'react';
import { Event } from '../utils/eventData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CategoryTrendsOverTimeProps {
  events: Event[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Music': '#A8DADC',
  'Arts & Theater': '#9FE2BF',
  'Food & Drink': '#FFB5A7',
  'Sports': '#F9C74F',
  'Nightlife': '#457B9D',
  'Comedy': '#F4A261',
  'Community': '#E9C46A',
  'Tech & Business': '#2A9D8F',
  'Fitness': '#90BE6D',
  'Family': '#F8B195'
};

export function CategoryTrendsOverTime({ events }: CategoryTrendsOverTimeProps) {
  const trendData = useMemo(() => {
    // Group events by hour
    const hourlyData: Record<number, Record<string, number>> = {};
    
    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = {};
    }
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      if (!hourlyData[hour][event.category]) {
        hourlyData[hour][event.category] = 0;
      }
      hourlyData[hour][event.category]++;
    });
    
    // Convert to array format for recharts
    return Object.entries(hourlyData).map(([hour, categories]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      ...categories
    }));
  }, [events]);
  
  // Get top 5 categories by total count
  const topCategories = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    
    events.forEach(event => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  }, [events]);
  
  const trendingCategory = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const recentEvents = events.filter(e => e.timestamp.getHours() === currentHour);
    
    const categoryCounts: Record<string, number> = {};
    recentEvents.forEach(event => {
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
    });
    
    const sorted = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
    return sorted[0] ? { category: sorted[0][0], count: sorted[0][1] } : null;
  }, [events]);

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Category Trends Over Time</h3>
      </div>
      
      {trendingCategory && (
        <div className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-[--text-secondary]">Trending Now</p>
          <p className="mt-1 text-foreground font-bold">{trendingCategory.category}</p>
          <p className="text-sm text-[--text-secondary] mt-1 font-bold">
            {trendingCategory.count} events this hour
          </p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={trendData} 
          margin={{ top: 10, right: 30, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="hour"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          
          {topCategories.map(category => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={CATEGORY_COLORS[category] || '#6B7280'}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-[--text-secondary]">
        <p className="font-bold">Showing top 5 categories by event count</p>
      </div>
    </div>
  );
}
