import React from "react"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: string
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  variant?: "pill" | "underlined"
  className?: string
}

/**
 * Clean Apple-styled segmented or underlined navigation tabs.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  variant = "pill",
  className,
}) => {
  if (!tabs || tabs.length === 0) return null

  return (
    <div
      role="tablist"
      className={cn(
        variant === "pill"
          ? "inline-flex items-center p-1 bg-muted/80 backdrop-blur-sm rounded-full border border-border/40"
          : "flex items-center border-b border-border space-x-6",
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "text-xs sm:text-sm font-medium transition-all duration-150 ease-apple focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none",
              variant === "pill"
                ? cn(
                    "px-3.5 py-1 rounded-full",
                    isActive
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )
                : cn(
                    "py-2.5 -mb-px border-b-2 font-medium",
                    isActive
                      ? "border-primary text-primary font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  ),
              tab.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-normal tabular-nums">
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
