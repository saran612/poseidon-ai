import React from "react"
import { cn } from "@/lib/utils"
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from "lucide-react"

export interface BannerProps {
  title: string
  message?: string
  type?: "info" | "warning" | "destructive" | "success"
  onClose?: () => void
  action?: React.ReactNode
  className?: string
}

/**
 * Top or inline full-width announcement banner.
 */
export const Banner: React.FC<BannerProps> = ({
  title,
  message,
  type = "info",
  onClose,
  action,
  className,
}) => {
  const styles = {
    info: "bg-primary/10 border-primary/20 text-primary",
    warning: "bg-warning/10 border-warning/20 text-warning",
    destructive: "bg-destructive/10 border-destructive/20 text-destructive",
    success: "bg-success/10 border-success/20 text-success",
  }

  const icons = {
    info: <Info className="h-4 w-4 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
    destructive: <AlertCircle className="h-4 w-4 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs",
        styles[type],
        className
      )}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icons[type]}
        <div className="truncate">
          <span className="font-semibold">{title}</span>
          {message && <span className="text-muted-foreground ml-1.5">{message}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close banner"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
