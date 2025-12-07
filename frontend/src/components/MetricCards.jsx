import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";

function MetricCard({ title, value, subtitle, tooltip }) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {title}
        </span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">{value}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

export function MetricCards({ metrics }) {
  return (
    <div className="flex gap-4">
      <MetricCard
        title="Total units sold"
        value={metrics.totalQuantity.toLocaleString("en-IN")}
        tooltip="Total number of units sold in the selected period"
      />
      <MetricCard
        title="Total Amount"
        value={`₹${metrics.totalAmount.toLocaleString("en-IN")}`}
        tooltip="Total revenue generated from sales"
      />
      <MetricCard
        title="Total Discount"
        value={`₹${metrics.totalDiscount.toLocaleString("en-IN")}`}
        tooltip="Total discount amount applied"
      />
    </div>
  );
}
