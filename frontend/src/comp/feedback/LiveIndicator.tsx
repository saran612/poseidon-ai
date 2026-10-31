import React from "react"
import { cn } from "@/lib/utils"

export interface LiveIndicatorProps {
  status?: "live" | "connecting" | "offline"
  label?: string
  className?: string
}

/**
 * Animated pulsating live connection status badge.
 */
export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  status = "live",
  label = status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline",
  className,
}) => {
  const dotColor = {
    live: "bg-success",
    connecting: "bg-warning",
    offline: "bg-muted-foreground",
  }[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border/40 bg-card select-none",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)} />
      </span>
      <span className="text-foreground">{label}</span>
    </span>
  )
}
