import React from "react"
import { cn } from "@/lib/utils"

export interface RadialGaugeProps {
  /** Value from 0 to max */
  value: number
  /** Maximum value (default 100) */
  max?: number
  /** Optional label */
  label?: string
  /** Subtitle or unit */
  unit?: string
  /** Size in pixels (default 120) */
  size?: number
  /** Stroke thickness */
  strokeWidth?: number
  /** Accent color variant */
  variant?: "primary" | "success" | "warning" | "destructive"
  className?: string
}

/**
 * Apple watch-inspired precision circular gauge.
 */
export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  max = 100,
  label,
  unit,
  size = 120,
  strokeWidth = 10,
  variant = "primary",
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const strokeColors = {
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }

  return (
    <div className={cn("inline-flex flex-col items-center justify-center select-none", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/60"
          />
          {/* Active Meter */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500 ease-apple", strokeColors[variant])}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight tabular-nums text-foreground">
            {value}
            {unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
          </span>
          {label && <span className="text-[10px] text-muted-foreground uppercase font-medium">{label}</span>}
        </div>
      </div>
    </div>
  )
}
