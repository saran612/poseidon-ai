import React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface MetricDefinition {
  key: string
  label: string
  value: number | string
  threshold?: number
}

export interface ModelMetricsCardProps {
  /** Dataset split the metric is evaluated on (Required: 'train' | 'validation' | 'test' | custom string) */
  split: string
  /** Model identifier or name */
  modelName: string
  /** Metrics array */
  metrics: MetricDefinition[]
  /** Optional evaluation date */
  evaluatedAt?: string
  isLoading?: boolean
  error?: string
  className?: string
}

/**
 * Model evaluation metrics card labeled as prototype-level with required evaluation split metadata.
 */
export const ModelMetricsCard: React.FC<ModelMetricsCardProps> = ({
  split,
  modelName,
  metrics,
  evaluatedAt,
  isLoading = false,
  error,
  className,
}) => {
  if (error) {
    return (
      <div className={cn("p-5 rounded-2xl bg-card border border-destructive/30 flex items-center gap-3 text-destructive text-xs", className)}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("p-5 rounded-2xl bg-card border border-border/80 space-y-3 animate-pulse", className)}>
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-muted/60 rounded" />
          <div className="h-10 bg-muted/60 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label={`${modelName} Prototype Metrics`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4", className)}
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">{modelName}</h4>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Prototype
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Evaluation Split: <span className="font-mono font-medium text-foreground">{split}</span>
            {evaluatedAt && ` • ${evaluatedAt}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map(m => (
          <div key={m.key} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-0.5">
            <span className="text-[11px] text-muted-foreground truncate block">{m.label}</span>
            <span className="text-lg font-bold tracking-tight text-foreground font-mono tabular-nums">
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
