import { useMemo } from "react";
import { Event, CATEGORIES } from "../utils/eventData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface CategoryAnalyticsProps {
  events: Event[];
}

const COLORS = [
  "#2D4B3A", // dark green
  "#6B8E6F", // sage green
  "#FFED00", // yellow
  "#4A7C59", // mid green
  "#5A7C6F", // blue green
  "#E3D5C4", // beige
  "#3A5A4A", // forest
  "#8BAA8F", // light sage
  "#FFD700", // gold
  "#9CAF9C", // soft sage
];

export function CategoryAnalytics({
  events,
}: CategoryAnalyticsProps) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};

    CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });

    events.forEach((event) => {
      counts[event.category]++;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const topCategory = categoryData[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <TrendingUp className="w-5 h-5 text-[--nyc-green-sage]" />
        <h2 className="text-[--text]">Popular Categories</h2>
      </div>

      {topCategory && (
        <div className="bg-[--nyc-beige]/30 border border-[--nyc-green-sage]/30 rounded-lg p-4">
          <p className="text-sm text-[--text-secondary]">
            Most Popular Right Now
          </p>
          <p className="text-[--text] mt-1">
            {topCategory.name}
          </p>
          <p className="text-sm text-[--text-secondary] mt-1">
            {topCategory.count} events
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={categoryData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}