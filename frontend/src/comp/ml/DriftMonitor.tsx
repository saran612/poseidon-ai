import React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

export interface DriftItem {
  feature: string
  psi: number
  threshold: number
  status: "stable" | "warning" | "critical"
}

export interface DriftMonitorProps {
  /** Evaluation dataset split (Required) */
  split: string
  items: DriftItem[]
  className?: string
}

/**
 * Data and concept drift tracking monitor with Population Stability Index gauges.
 */
export const DriftMonitor: React.FC<DriftMonitorProps> = ({
  split,
  items,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label={`Data Drift Monitor on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Data Drift Monitor</h4>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Prototype
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Baseline vs: <span className="font-mono font-medium text-foreground">{split}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => {
          const isCritical = item.status === "critical"
          const isWarning = item.status === "warning"
          return (
            <div key={item.feature} className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  {isCritical || isWarning ? (
                    <AlertTriangle className={cn("h-3.5 w-3.5", isCritical ? "text-destructive" : "text-warning")} />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  )}
                  <span className="font-medium text-foreground">{item.feature}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                  <span className={cn(isCritical ? "text-destructive font-bold" : isWarning ? "text-warning font-semibold" : "text-foreground")}>
                    PSI: {item.psi.toFixed(3)}
                  </span>
                  <span className="text-muted-foreground">(Limit: {item.threshold})</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isCritical ? "bg-destructive" : isWarning ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${Math.min(100, (item.psi / (item.threshold * 2)) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
