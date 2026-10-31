import React from "react"
import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}

/**
 * Calm centered empty state with optional illustration icon and action.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-3",
        className
      )}
    >
      <div className="p-3 bg-muted rounded-full text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="max-w-xs space-y-1">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
