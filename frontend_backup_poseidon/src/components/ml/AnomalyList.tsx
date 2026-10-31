import React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, ChevronRight } from "lucide-react"

export interface AnomalyItem {
  id: string
  score: number
  description: string
  detectedAt: string
  severity: "high" | "medium" | "low"
  attributedFeatures?: string[]
}

export interface AnomalyListProps {
  /** Evaluation dataset split (Required) */
  split: string
  anomalies: AnomalyItem[]
  onSelectAnomaly?: (id: string) => void
  className?: string
}

/**
 * Anomaly list inspector detailing out-of-distribution model inputs.
 */
export const AnomalyList: React.FC<AnomalyListProps> = ({
  split,
  anomalies,
  onSelectAnomaly,
  className,
}) => {
  const severityStyles = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-primary/10 text-primary border-primary/20",
  }

  return (
    <div
      role="region"
      aria-label={`Anomaly List on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Anomalous Inferences</h4>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Prototype
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Split: <span className="font-mono font-medium text-foreground">{split}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {anomalies.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No anomalies detected</div>
        ) : (
          anomalies.map(anom => (
            <div
              key={anom.id}
              onClick={() => onSelectAnomaly?.(anom.id)}
              className="p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-start gap-2.5 truncate">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="truncate space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{anom.id}</span>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-full border",
                        severityStyles[anom.severity]
                      )}
                    >
                      {anom.severity}
                    </span>
                    <span className="font-mono text-[11px] text-foreground tabular-nums font-semibold">
                      Score: {anom.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground truncate">{anom.description}</p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
