import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, X } from "lucide-react"

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  label?: string
  className?: string
}

/**
 * MultiSelect input with badge pill chips and searchable popup.
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  label,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [])

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val))
    } else {
      onChange([...selectedValues, val])
    }
  }

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedValues.filter(v => v !== val))
  }

  return (
    <div ref={containerRef} className={cn("relative w-full space-y-1 text-xs", className)}>
      {label && <label className="font-medium text-foreground block">{label}</label>}
      <div
        onClick={() => setOpen(!open)}
        className="w-full min-h-[36px] flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 transition-colors"
      >
        {selectedValues.length === 0 ? (
          <span className="text-muted-foreground px-2 py-1">{placeholder}</span>
        ) : (
          selectedValues.map(v => {
            const opt = options.find(o => o.value === v)
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-muted text-foreground text-[11px] font-medium"
              >
                <span>{opt ? opt.label : v}</span>
                <button
                  type="button"
                  onClick={e => removeValue(v, e)}
                  aria-label={`Remove ${opt ? opt.label : v}`}
                  className="hover:text-destructive p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto mr-1.5 shrink-0" />
      </div>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 mt-1 z-50 w-full bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-xl p-1 max-h-56 overflow-y-auto"
        >
          {options.map(opt => {
            const isSelected = selectedValues.includes(opt.value)
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleOption(opt.value)}
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
