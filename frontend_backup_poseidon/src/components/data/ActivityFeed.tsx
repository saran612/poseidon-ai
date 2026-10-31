import React from "react"
import { cn } from "@/lib/utils"

export interface ActivityEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  actor?: string
  status?: "success" | "warning" | "destructive" | "info"
}

export interface ActivityFeedProps {
  events: ActivityEvent[]
  className?: string
}

/**
 * Clean chronological activity stream.
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events, className }) => {
  if (!events || events.length === 0) {
    return (
      <div className={cn("p-5 rounded-2xl bg-card border border-border/80 text-center text-xs text-muted-foreground", className)}>
        No recent activity
      </div>
    )
  }

  const dotColors = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-primary",
  }

  return (
    <div className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4", className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Stream</h4>
      <div className="relative pl-4 border-l border-border/60 space-y-5 my-2">
        {events.map(ev => {
          const dotColor = (ev.status && dotColors[ev.status]) || "bg-primary"
          return (
            <div key={ev.id} className="relative group text-xs space-y-0.5">
              <span className={cn("absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-card", dotColor)} />
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-semibold text-foreground">{ev.title}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{ev.timestamp}</span>
              </div>
              {ev.description && <p className="text-muted-foreground leading-relaxed">{ev.description}</p>}
              {ev.actor && <span className="text-[11px] text-muted-foreground/80 font-mono">by {ev.actor}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
