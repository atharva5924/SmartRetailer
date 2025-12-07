import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../libs/utils";

export function RangeDropdown({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const wrapperRef = useRef(null);

  const currentMin = value?.min ?? min;
  const currentMax = value?.max ?? max;

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

  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= currentMax) {
      setIsApplying(true);
      onChange({ min: newMin, max: currentMax });
    }
  };

  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= currentMin) {
      setIsApplying(true);
      onChange({ min: currentMin, max: newMax });
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={cn(
          "filter-dropdown appearance-none pr-8 flex items-center justify-between cursor-pointer",
          isOpen && "ring-2 ring-primary/20"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">
          {label}: {currentMin}-{currentMax}
          {isApplying && <span className="ml-1 text-xs text-primary">●</span>}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform pointer-events-none",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[220px] bg-gray-100">
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-muted-foreground block">
              Min:{" "}
              <span className="font-semibold text-foreground">
                {currentMin}
              </span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentMin}
              onChange={handleMinChange}
              className="w-full h-2 bg-muted rounded-lg cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block">
              Max:{" "}
              <span className="font-semibold text-foreground">
                {currentMax}
              </span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentMax}
              onChange={handleMaxChange}
              className="w-full h-2 bg-muted rounded-lg cursor-pointer accent-primary"
            />
          </div>

          <div className="text-xs text-center text-muted-foreground pt-3 border-t border-border mt-3">
            Range: {currentMin} – {currentMax}
          </div>
        </div>
      )}
    </div>
  );
}
