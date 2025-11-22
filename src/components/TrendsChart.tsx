import { useMemo } from 'react';
import { Event, EventCategory } from '../utils/eventData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

interface TrendsChartProps {
  events: Event[];
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
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

export function TrendsChart({ events }: TrendsChartProps) {
  const trendsData = useMemo(() => {
    // Group events by hour
    const hourlyData: Record<string, Record<EventCategory, number>> = {};
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      const timeKey = `${hour}:00`;
      
      if (!hourlyData[timeKey]) {
        hourlyData[timeKey] = {
          'Music': 0,
          'Arts & Theater': 0,
          'Food & Drink': 0,
          'Sports': 0,
          'Nightlife': 0,
          'Comedy': 0,
          'Community': 0,
          'Tech & Business': 0,
          'Fitness': 0,
          'Family': 0
        };
      }
      
      hourlyData[timeKey][event.category]++;
    });
    
    // Convert to array and sort by time
    const sortedData = Object.entries(hourlyData)
      .map(([time, categories]) => ({
        time,
        ...categories
      }))
      .sort((a, b) => {
        const aHour = parseInt(a.time.split(':')[0]);
        const bHour = parseInt(b.time.split(':')[0]);
        return aHour - bHour;
      });
    
    // Get last 12 hours
    return sortedData.slice(-12);
  }, [events]);

  // Find top 5 categories
  const topCategories = useMemo(() => {
    const totals: Record<EventCategory, number> = {
      'Music': 0,
      'Arts & Theater': 0,
      'Food & Drink': 0,
      'Sports': 0,
      'Nightlife': 0,
      'Comedy': 0,
      'Community': 0,
      'Tech & Business': 0,
      'Fitness': 0,
      'Family': 0
    };
    
    events.forEach(event => {
      totals[event.category]++;
    });
    
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category as EventCategory);
  }, [events]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[--text-secondary]">
        Top 5 categories over the last 12 hours
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: '#737373' }}
            stroke="#E5E7EB"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#737373' }}
            stroke="#E5E7EB"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#0A0A0A'
            }}
            labelStyle={{ color: '#0A0A0A' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#0A0A0A' }} />
          {topCategories.map(category => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={CATEGORY_COLORS[category]}
              strokeWidth={2.5}
              dot={{ r: 2, fill: CATEGORY_COLORS[category] }}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="bg-[#DB592A]/10 border border-[#DB592A]/30 rounded-lg p-4">
        <p className="text-sm text-foreground font-bold">
          💡 Event popularity shifts throughout the day - Music & Nightlife peak in evenings, 
          while Fitness and Community events are most active in mornings.
        </p>
      </div>
    </div>
  );
}