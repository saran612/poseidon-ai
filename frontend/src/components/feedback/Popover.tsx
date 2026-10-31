import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface PopoverProps {
  trigger: React.ReactNode
  content: React.ReactNode
  align?: "left" | "right" | "center"
  className?: string
}

/**
 * Translucent floating popover surface with outside-click detection.
 */
export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = "left",
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

  const alignStyles = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          role="dialog"
          className={cn(
            "absolute mt-2 z-50 p-4 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl text-xs",
            alignStyles[align],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
