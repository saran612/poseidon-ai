import React from "react"
import { cn } from "@/lib/utils"
import { TrendBadge } from "./TrendBadge"
import { AlertCircle } from "lucide-react"

export interface KpiCardProps {
  /** Metric display label */
  label: string
  /** Primary metric value */
  value?: string | number
  /** Unit or suffix */
  unit?: string
  /** Delta percentage */
  delta?: number
  /** Context period (e.g., 'vs last 7 days') */
  period?: string
  /** Trend direction */
  trend?: "up" | "down" | "neutral"
  /** Optional inline sparkline numbers */
  sparklineData?: { value: number }[]
  /** Loading state */
  isLoading?: boolean
  /** Error message */
  error?: string
  /** Subtitle or secondary note */
  footnote?: string
  className?: string
}

/**
 * Calm Apple-styled KPI metric card with hairline border, delta badge, and mini sparkline.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  delta,
  period,
  trend,
  sparklineData,
  isLoading = false,
  error,
  footnote,
  className,
}) => {
  if (error) {
    return (
      <div
        role="alert"
        className={cn(
          "p-5 rounded-2xl bg-card border border-destructive/30 shadow-subtle flex items-start gap-3 text-destructive",
          className
        )}
      >
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase">{label}</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3 animate-pulse select-none",
          className
        )}
      >
        <div className="h-3.5 w-24 bg-muted rounded-full" />
        <div className="h-8 w-32 bg-muted rounded-lg" />
        <div className="h-4 w-40 bg-muted/60 rounded-full" />
      </div>
    )
  }

  // Calculate simple SVG sparkline path if points provided
  let sparklineSvg: React.ReactNode = null
  if (sparklineData && sparklineData.length > 1) {
    const values = sparklineData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const width = 80
    const height = 28

    const points = values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 6) - 3
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

    sparklineSvg = (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    )
  }

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-card border border-border/80 shadow-subtle hover:border-border transition-all duration-200 ease-apple space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="truncate">{label}</span>
        {sparklineSvg}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {value !== undefined ? value : "—"}
        </span>
        {unit && <span className="text-sm font-normal text-muted-foreground">{unit}</span>}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && <TrendBadge value={delta} trend={trend} />}
        {period && <span className="text-muted-foreground truncate">{period}</span>}
        {footnote && !period && <span className="text-muted-foreground text-[11px] truncate">{footnote}</span>}
      </div>
    </div>
  )
}
