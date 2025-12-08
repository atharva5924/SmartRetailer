import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../libs/utils";

export function MultiSelectDropdown({
  id,
  label,
  options,
  selectedValues,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText =
    selectedValues.length === 0
      ? label
      : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className="relative" ref={wrapperRef} id={id}>
      <div
        className={cn(
          "filter-dropdown appearance-none pr-8 !w-auto flex items-center justify-between cursor-pointer",
          isOpen && "ring-2 ring-primary/20"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate text-sm">{displayText}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform pointer-events-none ml-2 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full bg-gray-100 left-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px] max-h-64 overflow-y-auto">
          {selectedValues.length > 0 && (
            <button
              onClick={handleClear}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-destructive hover:bg-muted rounded mb-2"
            >
              Clear All
            </button>
          )}

          {/* Checkboxes */}
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleToggle(option)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground truncate">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
