import { useMemo } from 'react';
import { Event } from '../utils/eventData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

interface TimeOfDayAnalyticsProps {
  events: Event[];
}

export function TimeOfDayAnalytics({ events }: TimeOfDayAnalyticsProps) {
  const hourlyData = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    
    // Initialize all 24 hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0;
    }
    
    // Count events by hour
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour]++;
    });
    
    // Convert to array format for chart
    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      hourNum: parseInt(hour),
      count
    }));
  }, [events]);
  
  const peakHour = useMemo(() => {
    const sorted = [...hourlyData].sort((a, b) => b.count - a.count);
    return sorted[0];
  }, [hourlyData]);
  
  const getBarColor = (hourNum: number) => {
    if (hourNum >= 6 && hourNum < 12) return '#FFED00'; // Morning - Yellow
    if (hourNum >= 12 && hourNum < 17) return '#FF8C42'; // Afternoon - Orange
    if (hourNum >= 17 && hourNum < 22) return '#004953'; // Evening - Midnight green
    return '#6B7280'; // Night - Gray
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Peak Event Times</h3>
      </div>
      
      {peakHour && (
        <div className="bg-[#FFED00]/10 border border-[#FFED00]/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-[--text-secondary]">Busiest Hour</p>
          <p className="mt-1 text-foreground font-bold">{peakHour.hour}</p>
          <p className="text-sm text-[--text-secondary] mt-1 font-bold">{peakHour.count} events</p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {hourlyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.hourNum)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFED00' }}></div>
          <span className="text-[--text-secondary]">Morning (6-12)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF8C42' }}></div>
          <span className="text-[--text-secondary]">Afternoon (12-17)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#004953' }}></div>
          <span className="text-[--text-secondary]">Evening (17-22)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6B7280' }}></div>
          <span className="text-[--text-secondary]">Night (22-6)</span>
        </div>
      </div>
    </div>
  );
}
