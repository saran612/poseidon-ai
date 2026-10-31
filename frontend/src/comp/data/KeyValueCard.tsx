import React from "react"
import { cn } from "@/lib/utils"

export interface KeyValueItem {
  key: string
  label: string
  value: React.ReactNode
  copyable?: boolean
}

export interface KeyValueCardProps {
  title?: string
  items: KeyValueItem[]
  columns?: 1 | 2
  className?: string
}

/**
 * Structured key-value properties card with hairline borders.
 */
export const KeyValueCard: React.FC<KeyValueCardProps> = ({
  title,
  items,
  columns = 1,
  className,
}) => {
  return (
    <div className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}>
      {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>}
      <dl className={cn("divide-y divide-border/40 text-xs", columns === 2 && "sm:grid sm:grid-cols-2 sm:divide-y-0 sm:gap-4")}>
        {items.map(item => (
          <div key={item.key} className="py-2 flex justify-between items-baseline gap-2">
            <dt className="text-muted-foreground font-medium shrink-0">{item.label}</dt>
            <dd className="text-foreground font-mono tabular-nums text-right truncate">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
