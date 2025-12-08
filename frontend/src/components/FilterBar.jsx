import { ChevronDown, RotateCcw, X } from "lucide-react";
import { RangeDropdown } from "./RangeDropdown";
import { DateDropdown } from "./DateDropdown";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { cn } from "../libs/utils";

export function FilterBar({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  loading,
}) {
  console.log("Current Filters:", filterOptions);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
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

  // Multi-select filter IDs
  const multiSelectIds = [
    "region",
    "gender",
    "category",
    "tags",
    "paymentMethod",
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Reset Button */}
      <button
        onClick={onReset}
        className="filter-dropdown text-muted-foreground hover:text-foreground"
        title="Reset all filters"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Filter Dropdowns */}
      {filterOptions.map((filter) => {
        // Skip special filters
        if (["ageRange", "dateRange"].includes(filter.id)) return null;

        const isMultiSelect = multiSelectIds.includes(filter.id);
        const selectedValues = isMultiSelect
          ? filters[filter.id] || []
          : filters[filter.id] || "";

        if (isMultiSelect) {
          return (
            <MultiSelectDropdown
              key={filter.id}
              id={filter.id}
              label={filter.label}
              options={filter.options}
              selectedValues={selectedValues}
              onChange={(newValues) => onFilterChange(filter.id, newValues)}
            />
          );
        } else {
          // Single select (fallback, not used now)
          return (
            <div key={filter.id} className="relative">
              <select
                value={selectedValues}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                className={cn(
                  "filter-dropdown appearance-none pr-8 !w-auto",
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
          );
        }
      })}

      {/* Age Range Dropdown */}
      <RangeDropdown
        id="ageRange"
        label="Age"
        min={18}
        max={75}
        value={filters.ageRange}
        onChange={(value) => onFilterChange("ageRange", value)}
      />

      {/* Date Range Dropdown */}
      <DateDropdown
        value={filters.dateRange}
        onChange={(value) => onFilterChange("dateRange", value)}
      />

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

// Multi-Select Dropdown Component

