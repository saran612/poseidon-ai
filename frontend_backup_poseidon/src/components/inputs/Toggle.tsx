import React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

/**
 * iOS-style fluid toggle switch with accessible keyboard control.
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ease-apple",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col text-xs">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {description && <span className="text-[11px] text-muted-foreground">{description}</span>}
        </div>
      )}
    </label>
  )
}
