import React from "react"
import { cn } from "@/lib/utils"

export interface ExperimentRun {
  runId: string
  name: string
  split: string
  score: number
  primaryMetric: string
  createdAt: string
  status: "completed" | "failed" | "running"
}

export interface ExperimentHistoryTableProps {
  runs: ExperimentRun[]
  className?: string
}

/**
 * Historical ML model experimentation run ledger with split tags.
 */
export const ExperimentHistoryTable: React.FC<ExperimentHistoryTableProps> = ({
  runs,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label="Experiment History"
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground tracking-tight">Experiment Run History</h4>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Prototype
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border/60 text-muted-foreground">
            <tr>
              <th className="py-2 px-3">Run ID</th>
              <th className="py-2 px-3">Experiment Name</th>
              <th className="py-2 px-3">Split</th>
              <th className="py-2 px-3">Score</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {runs.map(run => (
              <tr key={run.runId} className="hover:bg-muted/30">
                <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{run.runId}</td>
                <td className="py-2 px-3 font-medium text-foreground">{run.name}</td>
                <td className="py-2 px-3">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {run.split}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono font-semibold tabular-nums text-foreground">
                  {run.score.toFixed(4)} ({run.primaryMetric})
                </td>
                <td className="py-2 px-3">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full",
                      run.status === "completed"
                        ? "bg-success/10 text-success"
                        : run.status === "running"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono text-[11px] text-muted-foreground">
                  {run.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
