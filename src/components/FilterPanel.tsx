import { CATEGORIES, BOROUGHS } from '../utils/eventData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: string;
  selectedBorough: string;
  onCategoryChange: (category: string) => void;
  onBoroughChange: (borough: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  selectedCategory,
  selectedBorough,
  onCategoryChange,
  onBoroughChange,
  onClearFilters
}: FilterPanelProps) {
  const hasActiveFilters = selectedCategory !== 'all' || selectedBorough !== 'all';

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[--nyc-orange]" />
          <h3 className="text-foreground font-bold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto py-1 px-2 text-[--nyc-orange] hover:bg-[--nyc-orange]/10"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm text-[--text-secondary] font-bold">Category</label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-white border-[--border] text-foreground">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-[--text-secondary] font-bold">Borough</label>
          <Select value={selectedBorough} onValueChange={onBoroughChange}>
            <SelectTrigger className="bg-white border-[--border] text-foreground">
              <SelectValue placeholder="All Boroughs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boroughs</SelectItem>
              {BOROUGHS.map(borough => (
                <SelectItem key={borough} value={borough}>
                  {borough}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t border-[--border]">
          <p className="text-xs text-[--nyc-orange] font-bold">
            ✓ Showing filtered results
          </p>
        </div>
      )}
    </div>
  );
}