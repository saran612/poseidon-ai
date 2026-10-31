import React from "react"
import { cn } from "@/lib/utils"
import { DEFAULT_CHART_COLORS } from "./chartUtils"

export interface SparklineProps {
  data: { value: number }[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  className?: string
}

/**
 * Lightweight inline SVG sparkline for dense tabular views.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 96,
  height = 24,
  color,
  strokeWidth = 1.75,
  className,
}) => {
  if (!data || data.length < 2) {
    return <div className={cn("inline-block bg-muted/40 rounded", className)} style={{ width, height }} />
  }

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const strokeColor = color || DEFAULT_CHART_COLORS[0]

  const points = values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible select-none inline-block", className)}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
