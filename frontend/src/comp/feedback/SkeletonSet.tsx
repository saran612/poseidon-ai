import React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "card" | "table"
}

/**
 * Pulse-animated hairline skeleton placeholder set.
 */
export const SkeletonSet: React.FC<SkeletonProps> = ({
  variant = "text",
  className,
  ...props
}) => {
  if (variant === "circular") {
    return (
      <div
        className={cn("h-10 w-10 rounded-full bg-muted/60 animate-pulse", className)}
        {...props}
      />
    )
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3 animate-pulse",
          className
        )}
        {...props}
      >
        <div className="h-4 w-28 bg-muted rounded-full" />
        <div className="h-8 w-44 bg-muted rounded-lg" />
        <div className="h-3 w-32 bg-muted/60 rounded-full" />
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2 animate-pulse", className)} {...props}>
        <div className="h-9 w-full bg-muted/80 rounded-lg" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 w-full bg-muted/40 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn("h-4 w-full bg-muted/60 rounded-md animate-pulse", className)}
      {...props}
    />
  )
}
