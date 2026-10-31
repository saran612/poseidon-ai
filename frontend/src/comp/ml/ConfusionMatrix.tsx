import React from "react"
import { cn } from "@/lib/utils"

export interface ConfusionMatrixProps {
  /** Evaluation dataset split (Required) */
  split: string
  /** Class labels */
  labels: string[]
  /** Square matrix: matrix[actual][predicted] */
  matrix: number[][]
  title?: string
  className?: string
}

/**
 * Confusion matrix classification breakdown tagged with dataset split and prototype indicators.
 */
export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  split,
  labels,
  matrix,
  title = "Confusion Matrix",
  className,
}) => {
  const allCounts = matrix.flat()
  const maxCount = Math.max(...allCounts) || 1

  return (
    <div
      role="region"
      aria-label={`${title} on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
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
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-muted-foreground text-[10px] uppercase font-semibold">
                Actual \ Pred
              </th>
              {labels.map(label => (
                <th key={label} className="p-2 text-muted-foreground text-[11px] font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, actualIdx) => (
              <tr key={actualIdx}>
                <th className="p-2 text-left text-muted-foreground text-[11px] font-semibold">
                  {labels[actualIdx]}
                </th>
                {row.map((val, predIdx) => {
                  const isDiagonal = actualIdx === predIdx
                  const intensity = Math.min(1, Math.max(0.08, val / maxCount))
                  return (
                    <td key={predIdx} className="p-1">
                      <div
                        className={cn(
                          "h-10 rounded-lg flex items-center justify-center font-mono tabular-nums text-xs font-semibold select-none",
                          isDiagonal ? "ring-1 ring-primary/40" : ""
                        )}
                        style={{
                          backgroundColor: isDiagonal
                            ? `hsl(var(--success) / ${intensity})`
                            : `hsl(var(--destructive) / ${intensity * 0.7})`,
                          color: intensity > 0.4 ? "#ffffff" : "hsl(var(--foreground))",
                        }}
                        title={`Actual: ${labels[actualIdx]}, Predicted: ${labels[predIdx]}, Count: ${val}`}
                      >
                        {val}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
