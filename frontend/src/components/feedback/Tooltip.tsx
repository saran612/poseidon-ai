import React, { useState } from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  className?: string
}

/**
 * Lightweight hover & focus accessible tooltip.
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium shadow-md whitespace-nowrap pointer-events-none transition-opacity",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
