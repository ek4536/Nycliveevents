import { useMemo } from 'react';
import { Event, Borough, BOROUGHS } from '../utils/eventData';
import { Activity } from 'lucide-react';

interface ActivityHeatmapProps {
  events: Event[];
}

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a matrix of borough x time slot
    const matrix: Record<string, Record<string, number>> = {};
    
    BOROUGHS.forEach(borough => {
      matrix[borough] = {
        'Morning': 0,
        'Afternoon': 0,
        'Evening': 0,
        'Night': 0
      };
    });
    
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      let timeSlot: string;
      
      if (hour >= 6 && hour < 12) timeSlot = 'Morning';
      else if (hour >= 12 && hour < 17) timeSlot = 'Afternoon';
      else if (hour >= 17 && hour < 22) timeSlot = 'Evening';
      else timeSlot = 'Night';
      
      matrix[event.borough][timeSlot]++;
    });
    
    return matrix;
  }, [events]);
  
  // Calculate sum counts for each time slot
  const timeSlotTotals = useMemo(() => {
    const totals: Record<string, number> = {
      'Morning': 0,
      'Afternoon': 0,
      'Evening': 0,
      'Night': 0
    };
    
    Object.values(heatmapData).forEach(borough => {
      Object.entries(borough).forEach(([slot, count]) => {
        totals[slot] += count;
      });
    });
    
    return totals;
  }, [heatmapData]);

  // Calculate sum counts for each borough
  const boroughTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    Object.entries(heatmapData).forEach(([borough, slots]) => {
      totals[borough] = Object.values(slots).reduce((sum, count) => sum + count, 0);
    });
    
    return totals;
  }, [heatmapData]);
  
  const maxValue = useMemo(() => {
    let max = 0;
    Object.values(heatmapData).forEach(borough => {
      Object.values(borough).forEach(count => {
        if (count > max) max = count;
      });
    });
    return max;
  }, [heatmapData]);
  
  const getHeatColor = (value: number) => {
    if (maxValue === 0) return '#F3F4F6';
    const intensity = value / maxValue;
    
    if (intensity === 0) return '#F3F4F6';
    if (intensity < 0.2) return '#FEF3C7'; // Very light yellow
    if (intensity < 0.4) return '#FCD34D'; // Light yellow
    if (intensity < 0.6) return '#FF8C42'; // Orange
    if (intensity < 0.8) return '#F97316'; // Dark orange
    return '#DC2626'; // Red (hottest)
  };
  
  const getMostActiveSlot = useMemo(() => {
    let maxCount = 0;
    let maxBorough = '';
    let maxSlot = '';
    
    Object.entries(heatmapData).forEach(([borough, slots]) => {
      Object.entries(slots).forEach(([slot, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxBorough = borough;
          maxSlot = slot;
        }
      });
    });
    
    return { borough: maxBorough, slot: maxSlot, count: maxCount };
  }, [heatmapData]);

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[--nyc-orange]" />
        <h3 className="font-bold text-foreground">Activity Heatmap</h3>
      </div>
      
      {getMostActiveSlot.count > 0 && (
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-[--text-secondary]">Peak Activity</p>
          <p className="mt-1 text-foreground font-bold">
            {getMostActiveSlot.borough} - {getMostActiveSlot.slot}
          </p>
          <p className="text-sm text-[--text-secondary] mt-1 font-bold">{getMostActiveSlot.count} events</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-[--text-secondary] font-bold border-b">Borough</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-2 text-center text-xs text-[--text-secondary] font-bold border-b">
                  {slot}
                </th>
              ))}
              <th className="p-2 text-center text-xs text-[--nyc-orange] font-bold border-b">Total</th>
            </tr>
          </thead>
          <tbody>
            {BOROUGHS.map(borough => (
              <tr key={borough}>
                <td className="p-2 text-sm text-foreground font-bold border-b">{borough}</td>
                {TIME_SLOTS.map(slot => {
                  const value = heatmapData[borough][slot];
                  return (
                    <td 
                      key={`${borough}-${slot}`}
                      className="p-4 text-center border-b relative group cursor-pointer"
                      style={{ backgroundColor: getHeatColor(value) }}
                    >
                      <span className="text-sm font-bold text-foreground">{value}</span>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                          {borough} - {slot}: {value} events
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="p-2 text-center border-b bg-[--nyc-orange]/10">
                  <span className="text-sm font-bold text-[--nyc-orange]">{boroughTotals[borough]}</span>
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-[--nyc-orange]/10">
              <td className="p-2 text-sm text-[--nyc-orange] font-bold border-t-2">Total</td>
              {TIME_SLOTS.map(slot => (
                <td key={`total-${slot}`} className="p-2 text-center border-t-2">
                  <span className="text-sm font-bold text-[--nyc-orange]">{timeSlotTotals[slot]}</span>
                </td>
              ))}
              <td className="p-2 text-center border-t-2">
                <span className="text-sm font-bold text-[--nyc-orange]">{events.length}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="text-[--text-secondary] font-bold">Activity Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F3F4F6' }}></div>
          <span className="text-[--text-secondary]">None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FCD34D' }}></div>
          <span className="text-[--text-secondary]">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF8C42' }}></div>
          <span className="text-[--text-secondary]">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
          <span className="text-[--text-secondary]">High</span>
        </div>
      </div>
    </div>
  );
}