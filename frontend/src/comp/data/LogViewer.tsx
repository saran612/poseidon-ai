import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Search, Copy, Check } from "lucide-react"

export interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
}

export interface LogViewerProps {
  logs: LogEntry[]
  maxHeight?: string
  className?: string
}

/**
 * High-density terminal-grade LogViewer with tabular numerals and severity styling.
 */
export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  maxHeight = "360px",
  className,
}) => {
  const [filter, setFilter] = useState("")
  const [copied, setCopied] = useState(false)

  const filteredLogs = logs.filter(
    l =>
      l.message.toLowerCase().includes(filter.toLowerCase()) ||
      l.level.toLowerCase().includes(filter.toLowerCase())
  )

  const copyAll = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const levelStyles = {
    info: "text-muted-foreground",
    warn: "text-warning",
    error: "text-destructive font-semibold",
    debug: "text-primary/80",
  }

  return (
    <div className={cn("rounded-2xl bg-card border border-border/80 shadow-subtle overflow-hidden flex flex-col text-xs", className)}>
      {/* Log Header Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border/60 bg-muted/20">
        <div className="relative w-48 sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-8 pr-2.5 py-1 text-[11px] placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Log Stream Body */}
      <div
        className="font-mono text-[11px] overflow-y-auto p-3 space-y-1 bg-background select-text"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No log entries</div>
        ) : (
          filteredLogs.map(l => (
            <div key={l.id} className="flex items-start gap-2 leading-relaxed hover:bg-muted/30 px-1 rounded">
              <span className="text-muted-foreground/60 tabular-nums shrink-0">{l.timestamp}</span>
              <span className={cn("uppercase text-[10px] w-12 shrink-0 text-center font-bold", levelStyles[l.level])}>
                {l.level}
              </span>
              <span className="text-foreground break-all">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
