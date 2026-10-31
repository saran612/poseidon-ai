import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react"

export interface ToastProps {
  id: string
  title: string
  description?: string
  type?: "success" | "warning" | "destructive" | "info"
  onDismiss?: (id: string) => void
  className?: string
}

/**
 * Floating translucent Toast alert modeled after macOS notification banners.
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = "info",
  onDismiss,
  className,
}) => {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-success shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
    destructive: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
    info: <Info className="h-4 w-4 text-primary shrink-0" />,
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-xl max-w-sm w-full select-none transition-all ease-apple",
        className
      )}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1 space-y-0.5 text-xs">
        <p className="font-semibold text-foreground tracking-tight">{title}</p>
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss toast"
          className="text-muted-foreground hover:text-foreground p-0.5 rounded-md transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
