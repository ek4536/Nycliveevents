import { useMemo } from 'react';
import { Event, BOROUGHS, Borough } from '../utils/eventData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MapPin } from 'lucide-react';

interface BoroughDistributionProps {
  events: Event[];
}

const BOROUGH_COLORS: Record<Borough, string> = {
  'Manhattan': '#2D4B3A',
  'Brooklyn': '#6B8E6F',
  'Queens': '#FFED00',
  'Bronx': '#4A7C59',
  'Staten Island': '#E3D5C4'
};

export function BoroughDistribution({ events }: BoroughDistributionProps) {
  const boroughData = useMemo(() => {
    const counts: Record<Borough, number> = {
      'Manhattan': 0,
      'Brooklyn': 0,
      'Queens': 0,
      'Bronx': 0,
      'Staten Island': 0
    };
    
    events.forEach(event => {
      counts[event.borough]++;
    });
    
    return BOROUGHS.map(borough => ({
      name: borough,
      value: counts[borough],
      percentage: events.length > 0 ? ((counts[borough] / events.length) * 100).toFixed(1) : '0'
    })).sort((a, b) => b.value - a.value);
  }, [events]);

  const topBorough = boroughData[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <MapPin className="w-5 h-5 text-[--nyc-green-sage]" />
        <h2 className="text-[--text]">Borough Distribution</h2>
      </div>

      {topBorough && (
        <div className="bg-[--nyc-beige]/30 border border-[--nyc-green-sage]/30 rounded-lg p-4">
          <p className="text-sm text-[--text-secondary]">Most Active Borough</p>
          <p className="text-[--text] mt-1">{topBorough.name}</p>
          <p className="text-sm text-[--text-secondary] mt-1">
            {topBorough.value} events ({topBorough.percentage}%)
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={boroughData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {boroughData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BOROUGH_COLORS[entry.name as Borough]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {boroughData.map((borough, index) => (
          <div key={borough.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: BOROUGH_COLORS[borough.name as Borough] }}
              />
              <span className="text-sm text-[--text]">{borough.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[--text-secondary]">{borough.value} events</span>
              <span className="text-sm text-[--text]">{borough.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[--nyc-yellow]/20 border border-[--nyc-green-sage]/30 rounded-lg p-4">
        <p className="text-sm text-[--text-secondary]">Spatial Pattern</p>
        <p className="text-sm text-[--text] mt-1">
          Manhattan and Brooklyn dominate NYC's event scene, accounting for the majority of 
          activities. Queens is rising as a cultural hub with diverse community events.
        </p>
      </div>
    </div>
  );
}