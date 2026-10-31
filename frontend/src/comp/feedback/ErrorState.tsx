import React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, RefreshCw } from "lucide-react"

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

/**
 * Resilient error notification state with retry callback button.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  isRetrying = false,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3",
        className
      )}
    >
      <div className="p-2.5 bg-destructive/10 rounded-full text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="max-w-xs space-y-1">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-background border border-border shadow-sm hover:bg-muted text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")} />
          <span>{isRetrying ? "Retrying..." : "Try again"}</span>
        </button>
      )}
    </div>
  )
}
