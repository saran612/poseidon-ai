import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

export interface DateRange {
  startDate: string
  endDate: string
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  presets?: { label: string; range: DateRange }[]
  className?: string
}

const defaultPresets: { label: string; range: DateRange }[] = [
  { label: "Today", range: { startDate: "2026-10-30", endDate: "2026-10-30" } },
  { label: "Last 7 Days", range: { startDate: "2026-10-23", endDate: "2026-10-30" } },
  { label: "Last 30 Days", range: { startDate: "2026-09-30", endDate: "2026-10-30" } },
  { label: "Last Quarter", range: { startDate: "2026-07-01", endDate: "2026-09-30" } },
]

/**
 * Compact date range selector with preset shortcuts and custom range inputs.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { startDate: "2026-10-23", endDate: "2026-10-30" },
  onChange,
  presets = defaultPresets,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentRange, setCurrentRange] = useState<DateRange>(value)

  const handlePreset = (preset: DateRange) => {
    setCurrentRange(preset)
    onChange?.(preset)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card/80 backdrop-blur-sm text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="tabular-nums font-mono text-[11px]">
          {currentRange.startDate} → {currentRange.endDate}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Select date range"
          className="absolute right-0 mt-2 z-40 w-64 bg-card/95 backdrop-blur-md border border-border/80 shadow-lg rounded-xl p-3 space-y-3"
        >
          <div className="text-xs font-semibold text-muted-foreground">Presets</div>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p.range)}
                className="px-2 py-1 text-left text-xs rounded-md hover:bg-muted text-foreground transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Custom</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5" htmlFor="start-date-input">
                  Start
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  value={currentRange.startDate}
                  onChange={e => {
                    const next = { ...currentRange, startDate: e.target.value }
                    setCurrentRange(next)
                    onChange?.(next)
                  }}
                  className="w-full bg-background border border-border rounded px-1.5 py-1 text-[11px]"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5" htmlFor="end-date-input">
                  End
                </label>
                <input
                  id="end-date-input"
                  type="date"
                  value={currentRange.endDate}
                  onChange={e => {
                    const next = { ...currentRange, endDate: e.target.value }
                    setCurrentRange(next)
                    onChange?.(next)
                  }}
                  className="w-full bg-background border border-border rounded px-1.5 py-1 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
