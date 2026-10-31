import React from "react"
import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"

export interface ActiveFilter {
  key: string
  label: string
  value: string
}

export interface FilterBarProps {
  filters: ActiveFilter[]
  onRemove: (key: string) => void
  onClearAll?: () => void
  className?: string
  children?: React.ReactNode
}

/**
 * Clean filter bar displaying active criteria pills and quick actions.
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onRemove,
  onClearAll,
  className,
  children,
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-2 text-xs", className)}>
      <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
        <Filter className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium">Filters:</span>
      </div>

      {children}

      {filters.map(filter => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-muted border border-border/60 text-foreground font-medium"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            type="button"
            onClick={() => onRemove(filter.key)}
            aria-label={`Remove filter for ${filter.label}`}
            className="p-0.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {filters.length > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-primary hover:underline ml-2 font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
