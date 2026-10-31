import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface SidebarItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  active?: boolean
  onClick?: () => void
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** List of navigation items */
  items: SidebarItem[]
  /** Header title or custom brand element */
  brand?: React.ReactNode
  /** Footer element (e.g., user profile or collapse toggle) */
  footer?: React.ReactNode
  /** Whether the sidebar is collapsed */
  collapsed?: boolean
  /** Callback fired when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Loading state indicator */
  isLoading?: boolean
}

/**
 * Collapsible Apple-inspired navigation sidebar with subtle hairline borders and blur.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  brand,
  footer,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  isLoading = false,
  className,
  ...props
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const toggleCollapse = () => {
    const next = !isCollapsed
    if (controlledCollapsed === undefined) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  return (
    <aside
      aria-label="Primary Navigation"
      className={cn(
        "relative flex flex-col h-full bg-card/80 backdrop-blur-md border-r border-border transition-all duration-200 ease-apple select-none",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {/* Brand / Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border/60">
        {!isCollapsed && brand && <div className="truncate font-medium text-sm text-foreground">{brand}</div>}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-muted/60 animate-pulse rounded-md" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No navigation items</div>
        ) : (
          items.map(item => {
            const Icon = item.icon
            return (
              <a
                key={item.id}
                href={item.href || "#"}
                onClick={e => {
                  if (item.onClick) {
                    e.preventDefault()
                    item.onClick()
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  item.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                title={isCollapsed ? item.label : undefined}
                aria-current={item.active ? "page" : undefined}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted font-normal text-muted-foreground tabular-nums">
                    {item.badge}
                  </span>
                )}
              </a>
            )
          })
        )}
      </nav>

      {/* Footer */}
      {footer && <div className="p-3 border-t border-border/60">{footer}</div>}
    </aside>
  )
}
