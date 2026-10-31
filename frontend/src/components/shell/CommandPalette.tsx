import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

export interface CommandAction {
  id: string
  title: string
  category?: string
  shortcut?: string
  onSelect: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  actions: CommandAction[]
  placeholder?: string
}

/**
 * Spotlight-style fast keyboard command palette.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  actions,
  placeholder = "Type a command or search...",
}) => {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = actions.filter(
    a =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(query.toLowerCase()))
  )

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1 < filtered.length ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1))
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault()
        filtered[selectedIndex].onSelect()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, filtered, selectedIndex, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-background/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden transition-all ease-apple"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border/60">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            placeholder={placeholder}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No matching commands</div>
          ) : (
            filtered.map((action, idx) => (
              <div
                key={action.id}
                role="option"
                aria-selected={idx === selectedIndex}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer select-none transition-colors",
                  idx === selectedIndex ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-muted"
                )}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  action.onSelect()
                  onClose()
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  {action.category && (
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                        idx === selectedIndex ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {action.category}
                    </span>
                  )}
                  <span className="truncate">{action.title}</span>
                </div>
                {action.shortcut && (
                  <kbd
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-mono",
                      idx === selectedIndex ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
