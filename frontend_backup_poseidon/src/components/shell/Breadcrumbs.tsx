import React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
}

/**
 * Accessible navigational breadcrumbs trail.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className, ...props }) => {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs sm:text-sm", className)} {...props}>
      <ol className="flex items-center gap-1.5 list-none m-0 p-0 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span className="font-semibold text-foreground truncate" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href || "#"}
                  className="hover:text-foreground transition-colors truncate focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
