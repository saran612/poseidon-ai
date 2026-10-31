import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "subtle" | "destructive" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

/**
 * Apple-inspired tactile button with restrained elevation and precise feedback states.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-medium transition-all duration-150 ease-apple select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"

    const variants = {
      primary: "bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40",
      subtle: "bg-muted text-foreground hover:bg-muted/80",
      destructive: "bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90",
      ghost: "text-foreground hover:bg-muted/60",
      outline: "border border-border bg-transparent text-foreground hover:bg-muted/60",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-7 px-3 text-[11px]",
      lg: "h-11 px-6 text-sm",
      icon: "h-8 w-8 p-0 rounded-full",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
