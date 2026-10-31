import React, { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface DetailDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * Slide-over detail drawer panel with translucent backdrop.
 */
export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md h-full bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col transition-transform ease-apple",
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>

        {/* Footer */}
        {footer && <div className="p-4 border-t border-border/60 bg-muted/20">{footer}</div>}
      </div>
    </div>
  )
}
