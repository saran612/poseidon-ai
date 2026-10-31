import React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface TrendBadgeProps {
  /** Numeric percentage or delta value */
  value: number
  /** Trend direction */
  trend?: "up" | "down" | "neutral"
  /** Whether an increase is considered positive (default true) */
  isPositiveGood?: boolean
  /** Optional suffix (e.g. '%') */
  suffix?: string
  className?: string
}

/**
 * Restrained indicator badge for deltas and trend direction with tabular numbers.
 */
export const TrendBadge: React.FC<TrendBadgeProps> = ({
  value,
  trend = value > 0 ? "up" : value < 0 ? "down" : "neutral",
  isPositiveGood = true,
  suffix = "%",
  className,
}) => {
  const isFavorable = trend === "neutral" ? null : trend === "up" ? isPositiveGood : !isPositiveGood

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums select-none transition-colors",
        isFavorable === null
          ? "bg-muted text-muted-foreground"
          : isFavorable
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive",
        className
      )}
      aria-label={`Trend: ${trend}, value: ${value > 0 ? "+" : ""}${value}${suffix}`}
    >
      {trend === "up" && <TrendingUp className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {trend === "down" && <TrendingDown className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {trend === "neutral" && <Minus className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>
        {value > 0 ? "+" : ""}
        {value}
        {suffix}
      </span>
    </span>
  )
}
