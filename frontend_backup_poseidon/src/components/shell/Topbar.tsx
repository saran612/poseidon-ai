import React from "react"
import { cn } from "@/lib/utils"

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Left slot element (e.g. title, breadcrumbs, search trigger) */
  leftSlot?: React.ReactNode
  /** Center slot element (e.g. segmented control) */
  centerSlot?: React.ReactNode
  /** Right slot element (e.g. notifications, user profile, theme toggle) */
  rightSlot?: React.ReactNode
}

/**
 * Translucent frosted glass top application bar with precision hairline border.
 */
export const Topbar: React.FC<TopbarProps> = ({
  leftSlot,
  centerSlot,
  rightSlot,
  className,
  ...props
}) => {
  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border/80 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">{leftSlot}</div>
      {centerSlot && <div className="hidden md:flex items-center justify-center flex-1">{centerSlot}</div>}
      <div className="flex items-center gap-2 sm:gap-3">{rightSlot}</div>
    </header>
  )
}
