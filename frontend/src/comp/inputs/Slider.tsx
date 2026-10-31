import React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
  disabled?: boolean
  className?: string
}

/**
 * Restrained continuous slider input with numerical indicator.
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn("w-full space-y-2 text-xs select-none", className)}>
      {(label || unit) && (
        <div className="flex justify-between items-center">
          {label && <label className="font-medium text-foreground">{label}</label>}
          <span className="font-mono tabular-nums text-muted-foreground">
            {value}
            {unit}
          </span>
        </div>
      )}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
      />
    </div>
  )
}
