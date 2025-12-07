import { ChevronDown, RotateCcw } from "lucide-react";
import { RangeDropdown } from "./RangeDropdown";
import { DateDropdown } from "./DateDropdown";
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
      {filterOptions
        .filter((f) => !["ageRange", "date"].includes(f.id))
        .map((filter) => (
          <div key={filter.id} className="relative">
            <select
              value={filters[filter.id]}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              className={cn(
                "filter-dropdown appearance-none",
                filter.id === "category" && "min-w-[140px]",
                filter.id === "region" && "min-w-[125px]",
                filter.id === "gender" && "min-w-[75px]",
                filter.id === "region" && "min-w-[130px]",
                filter.id === "paymentMethod" && "min-w-[140px]",
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
      <RangeDropdown
        id="ageRange"
        label="Age"
        min={18}
        max={75}
        value={filters.ageRange}
        onChange={(value) => onFilterChange("ageRange", value)}
      />
      <DateDropdown
        key="dateRange"
        value={filters.dateRange}
        onChange={(value) => onFilterChange("dateRange", value)}
      />
      {/* Sort By */}
      <div className="relative ml-30">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange("sortBy", e.target.value)}
          className={cn(
            "filter-dropdown appearance-none pr-8 w-70",
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
