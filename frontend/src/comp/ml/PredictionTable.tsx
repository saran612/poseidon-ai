import React from "react"
import { cn } from "@/lib/utils"

export interface PredictionRow {
  id: string
  inputSummary: string
  predictedLabel: string
  actualLabel?: string
  confidence: number
  flags?: string[]
}

export interface PredictionTableProps {
  /** Evaluation dataset split (Required) */
  split: string
  predictions: PredictionRow[]
  className?: string
}

/**
 * Model inference predictions inspector table showing confidence and warning flags.
 */
export const PredictionTable: React.FC<PredictionTableProps> = ({
  split,
  predictions,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label={`Predictions on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Predictions Inspector</h4>
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
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Input Summary</th>
              <th className="py-2 px-3">Prediction</th>
              <th className="py-2 px-3">Confidence</th>
              <th className="py-2 px-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {predictions.map(row => {
              const confPct = (row.confidence * 100).toFixed(1)
              return (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{row.id}</td>
                  <td className="py-2 px-3 font-medium max-w-xs truncate">{row.inputSummary}</td>
                  <td className="py-2 px-3 font-semibold text-foreground">{row.predictedLabel}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] tabular-nums">{confPct}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap gap-1">
                      {row.flags && row.flags.length > 0 ? (
                        row.flags.map(f => (
                          <span
                            key={f}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium"
                          >
                            {f}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground">None</span>
                      )}
                    </div>
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
