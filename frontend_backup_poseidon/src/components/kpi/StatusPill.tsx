import React from "react"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "warning" | "destructive" | "neutral" | "info"

export interface StatusPillProps {
  status: StatusType
  label: string
  dot?: boolean
  className?: string
}

/**
 * Minimal status pill conforming to Apple semantic tokens.
 */
export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  dot = true,
  className,
}) => {
  const styles: Record<StatusType, { bg: string; text: string; dot: string }> = {
    success: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
    warning: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
    destructive: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
    info: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
    neutral: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  }

  const s = styles[status] || styles.neutral

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-border/40 select-none",
        s.bg,
        s.text,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  )
}
