import React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps {
  /** Value from 0 to max */
  value: number
  /** Maximum value (default 100) */
  max?: number
  /** Label for accessible reporting */
  label?: string
  /** Visual variant */
  variant?: "primary" | "success" | "warning" | "destructive"
  /** Show numerical percentage text alongside */
  showPercentage?: boolean
  className?: string
}

/**
 * Calm, hairline progress bar with smooth transition and tabular indicators.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  variant = "primary",
  showPercentage = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const variantStyles = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground font-mono tabular-nums text-[11px]">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
        className="h-1.5 w-full bg-muted rounded-full overflow-hidden"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-apple",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
