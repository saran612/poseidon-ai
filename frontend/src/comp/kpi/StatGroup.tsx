import React from "react"
import { cn } from "@/lib/utils"

export interface StatItem {
  id: string
  label: string
  value: string | number
  unit?: string
  sublabel?: string
}

export interface StatGroupProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * Clean grouped stats summary section with hairline dividing borders.
 */
export const StatGroup: React.FC<StatGroupProps> = ({
  stats,
  columns = 4,
  className,
}) => {
  const colStyles = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div
      className={cn(
        "grid bg-card border border-border/80 rounded-2xl shadow-subtle divide-y sm:divide-y-0 sm:divide-x divide-border/60 overflow-hidden",
        colStyles[columns],
        className
      )}
    >
      {stats.map(s => (
        <div key={s.id} className="p-4 sm:p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground truncate">{s.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {s.value}
            </span>
            {s.unit && <span className="text-xs text-muted-foreground">{s.unit}</span>}
          </div>
          {s.sublabel && <p className="text-[11px] text-muted-foreground truncate">{s.sublabel}</p>}
        </div>
      ))}
    </div>
  )
}
