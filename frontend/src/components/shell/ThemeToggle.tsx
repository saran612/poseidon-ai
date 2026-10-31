import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Sun, Moon } from "lucide-react"

export interface ThemeToggleProps {
  className?: string
  /** Optional controlled theme */
  theme?: "light" | "dark"
  /** Callback on change */
  onThemeChange?: (theme: "light" | "dark") => void
}

/**
 * Apple-style tactile theme toggle button.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  theme: controlledTheme,
  onThemeChange,
}) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (controlledTheme !== undefined) {
      setIsDark(controlledTheme === "dark")
    } else {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
  }, [controlledTheme])

  const toggle = () => {
    const next = isDark ? "light" : "dark"
    if (controlledTheme === undefined) {
      if (next === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      setIsDark(!isDark)
    }
    onThemeChange?.(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "p-2 rounded-full border border-border bg-card/80 text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700" aria-hidden="true" />
      )}
    </button>
  )
}
