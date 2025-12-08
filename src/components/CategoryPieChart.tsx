import { Event } from '../utils/eventData';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CategoryPieChartProps {
  events: Event[];
}

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

export function CategoryPieChart({ events }: CategoryPieChartProps) {
  // Aggregate events by category
  const categoryData = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format
  const chartData = Object.entries(categoryData)
    .map(([name, value]) => ({
      name,
      value,
      percentage: ((value / events.length) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-bold text-[--text]">{payload[0].name}</p>
          <p className="text-sm text-[--text-secondary]">
            {payload[0].value} events ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Category Distribution</h3>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-[--text-secondary] py-8">
          No events to display
        </p>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={categoryColors[entry.name] || '#cccccc'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm font-bold text-[--text]">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
