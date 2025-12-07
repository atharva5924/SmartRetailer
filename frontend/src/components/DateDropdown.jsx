import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../libs/utils";

export function DateDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
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

  const handleStartChange = (e) => {
    setIsApplying(true);
    onChange({
      start: e.target.value,
      end: value?.end ?? "",
    });
  };

  const handleEndChange = (e) => {
    setIsApplying(true);
    onChange({
      start: value?.start ?? "",
      end: e.target.value,
    });
  };

  const displayText =
    value?.start || value?.end
      ? `${value?.start || "Start"} - ${value?.end || "End"}`
      : "All Dates";

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={cn(
          "filter-dropdown appearance-none pr-8 flex items-center justify-between cursor-pointer",
          isOpen && "ring-2 ring-primary/20"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">Date: {displayText}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform pointer-events-none",
            isOpen && "rotate-180"
          )}
        />
        {isApplying && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[240px] bg-gray-100">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={value?.start ?? ""}
                onChange={handleStartChange}
                className="w-full form-control text-xs p-2 border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={value?.end ?? ""}
                onChange={handleEndChange}
                className="w-full form-control text-xs p-2 border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {value?.start && value?.end && (
              <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
                {new Date(value.start).toLocaleDateString()} –{" "}
                {new Date(value.end).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
