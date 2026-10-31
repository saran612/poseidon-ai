import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"

export interface JsonViewerProps {
  data: any
  initialExpanded?: boolean
  className?: string
}

/**
 * Interactive tree JsonViewer with formatting and clipboard copy.
 */
export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  initialExpanded: _initialExpanded = true,
  className,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("p-4 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-2 text-xs", className)}>
      <div className="flex justify-between items-center pb-2 border-b border-border/60">
        <span className="font-mono text-[11px] text-muted-foreground uppercase">JSON Payload</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <pre className="font-mono text-[11px] p-2 bg-background rounded-lg overflow-x-auto text-foreground max-h-72">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
