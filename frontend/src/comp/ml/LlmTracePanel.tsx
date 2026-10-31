import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check, Clock, Zap, DollarSign } from "lucide-react"

export interface LlmTraceData {
  traceId: string
  timestamp: string
  prompt: string
  response: string
  latencyMs: number
  tokensIn: number
  tokensOut: number
  model?: string
  costUsd?: number
}

export interface LlmTracePanelProps {
  trace: LlmTraceData
  className?: string
}

/**
 * Detailed telemetry inspection panel for LLM prompt completions.
 */
export const LlmTracePanel: React.FC<LlmTracePanelProps> = ({
  trace,
  className,
}) => {
  const [copied, setCopied] = useState<"prompt" | "response" | null>(null)

  const copyText = (text: string, type: "prompt" | "response") => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div
      role="region"
      aria-label="LLM Trace Panel"
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4 text-xs", className)}
    >
      {/* Header telemetry summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{trace.traceId}</span>
          {trace.model && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {trace.model}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-muted-foreground font-mono tabular-nums text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {trace.latencyMs}ms
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> {trace.tokensIn + trace.tokensOut} tokens ({trace.tokensIn} in / {trace.tokensOut} out)
          </span>
          {trace.costUsd !== undefined && (
            <span className="flex items-center gap-0.5">
              <DollarSign className="h-3.5 w-3.5" /> ${trace.costUsd.toFixed(5)}
            </span>
          )}
        </div>
      </div>

      {/* Prompt Card */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-muted-foreground text-[11px]">
          <span className="font-semibold uppercase tracking-wider">Input Prompt</span>
          <button
            type="button"
            onClick={() => copyText(trace.prompt, "prompt")}
            className="hover:text-foreground flex items-center gap-1 text-[10px]"
          >
            {copied === "prompt" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied === "prompt" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="p-3 bg-muted/40 rounded-xl border border-border/40 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
          {trace.prompt}
        </div>
      </div>

      {/* Response Card */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-muted-foreground text-[11px]">
          <span className="font-semibold uppercase tracking-wider">Model Completion</span>
          <button
            type="button"
            onClick={() => copyText(trace.response, "response")}
            className="hover:text-foreground flex items-center gap-1 text-[10px]"
          >
            {copied === "response" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied === "response" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="p-3 bg-muted/20 rounded-xl border border-border/40 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
          {trace.response}
        </div>
      </div>
    </div>
  )
}
