import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Accessible custom single-select dropdown.
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-1 text-xs", className)}>
      {label && <label className="font-medium text-foreground block">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 mt-1 z-50 w-full bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-xl p-1 max-h-56 overflow-y-auto"
        >
          {options.map(opt => {
            const isSelected = opt.value === value
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors",
                  isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
