import React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

/**
 * Pill-shaped Apple Search input with instant clear action.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  ...props
}) => {
  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted/60 hover:bg-muted focus:bg-background border border-transparent focus:border-border rounded-full pl-9 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-apple focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("")
            onClear?.()
          }}
          aria-label="Clear search input"
          className="absolute right-2.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
