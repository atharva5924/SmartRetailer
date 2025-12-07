import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "../libs/utils";

export function FilterBar({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {/* skeleton pills matching your filter style */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="filter-dropdown animate-pulse bg-muted/60 text-transparent"
          >
            Loading...
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Reset Button */}
      <button
        onClick={onReset}
        className="filter-dropdown text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Filter Dropdowns */}
      {filterOptions.map((filter) => (
        <div key={filter.id} className="relative">
          <select
            value={filters[filter.id]}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className={cn(
              "filter-dropdown appearance-none pr-8 min-w-[130px]",
              "focus:outline-none focus:ring-2 focus:ring-primary/20"
            )}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
      ))}

      {/* Sort By */}
      <div className="relative ml-8">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
          className={cn(
            "filter-dropdown appearance-none pr-8 w-60",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          <option value="name-asc">Sort by: Customer Name (A-Z)</option>
          <option value="name-desc">Sort by: Customer Name (Z-A)</option>
          <option value="date-asc">Sort by: Date (Oldest)</option>
          <option value="date-desc">Sort by: Date (Newest)</option>
          <option value="quantity-desc">Sort by: Quantity (Desc)</option>
          <option value="quantity-asc">Sort by: Quantity (Asc)</option>
        </select>
        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    </div>
  );
}
