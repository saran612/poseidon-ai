import React from "react"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

export interface ComparisonMetric {
  name: string
  candidateValue: number
  baselineValue: number
  unit?: string
  higherIsBetter?: boolean
}

export interface BaselineComparisonProps {
  /** Dataset split (Required) */
  split: string
  candidateName: string
  baselineName: string
  metrics: ComparisonMetric[]
  className?: string
}

/**
 * Head-to-head model candidate comparison against a baseline benchmark.
 */
export const BaselineComparison: React.FC<BaselineComparisonProps> = ({
  split,
  candidateName,
  baselineName,
  metrics,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label={`Baseline Comparison on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Baseline Benchmarking</h4>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Prototype
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Split: <span className="font-mono font-medium text-foreground">{split}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border/60 text-muted-foreground">
            <tr>
              <th className="py-2 px-3">Metric</th>
              <th className="py-2 px-3">{candidateName} (Candidate)</th>
              <th className="py-2 px-3">{baselineName} (Baseline)</th>
              <th className="py-2 px-3 text-right">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {metrics.map(m => {
              const diff = m.candidateValue - m.baselineValue
              const isGood = m.higherIsBetter !== false ? diff > 0 : diff < 0
              return (
                <tr key={m.name} className="hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium text-foreground">{m.name}</td>
                  <td className="py-2 px-3 font-mono font-semibold tabular-nums text-foreground">
                    {m.candidateValue} {m.unit}
                  </td>
                  <td className="py-2 px-3 font-mono text-muted-foreground tabular-nums">
                    {m.baselineValue} {m.unit}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-mono font-semibold text-[11px] tabular-nums",
                        diff === 0 ? "text-muted-foreground" : isGood ? "text-success" : "text-destructive"
                      )}
                    >
                      {diff > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : diff < 0 ? (
                        <ArrowDownRight className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
