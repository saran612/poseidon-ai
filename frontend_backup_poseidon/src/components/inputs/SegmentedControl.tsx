import React from "react"
import { cn } from "@/lib/utils"

export interface SegmentOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (val: T) => void
  size?: "sm" | "default"
  className?: string
}

/**
 * macOS-style sliding segmented control with tactile active pill.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "default",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center p-0.5 bg-muted rounded-full border border-border/40 select-none",
        size === "sm" ? "h-7" : "h-8",
        className
      )}
    >
      {options.map(opt => {
        const isSelected = opt.value === value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 rounded-full text-xs font-medium transition-all duration-150 ease-apple focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              size === "sm" ? "h-6 text-[11px]" : "h-7 text-xs",
              isSelected
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
