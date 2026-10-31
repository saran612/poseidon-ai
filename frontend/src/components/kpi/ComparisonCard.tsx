import React from "react"
import { cn } from "@/lib/utils"
import { TrendBadge } from "./TrendBadge"

export interface ComparisonCardProps {
  title: string
  currentValue: string | number
  currentLabel: string
  baselineValue: string | number
  baselineLabel: string
  delta?: number
  unit?: string
  className?: string
}

/**
 * Head-to-head baseline versus current performance metric card.
 */
export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  currentValue,
  currentLabel,
  baselineValue,
  baselineLabel,
  delta,
  unit,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
        {delta !== undefined && <TrendBadge value={delta} />}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/60">
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground">{currentLabel}</span>
          <div className="text-xl font-bold tracking-tight text-foreground tabular-nums">
            {currentValue}
            {unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
          </div>
        </div>

        <div className="space-y-0.5 border-l border-border/60 pl-4">
          <span className="text-[11px] text-muted-foreground">{baselineLabel}</span>
          <div className="text-xl font-medium tracking-tight text-muted-foreground tabular-nums">
            {baselineValue}
            {unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
