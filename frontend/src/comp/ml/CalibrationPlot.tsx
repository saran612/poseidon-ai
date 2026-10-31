import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

export interface CalibrationBucket {
  predictedProb: number
  observedProb: number
  count?: number
}

export interface CalibrationPlotProps {
  /** Evaluation dataset split (Required) */
  split: string
  data: CalibrationBucket[]
  title?: string
  height?: number
  className?: string
}

/**
 * Probability calibration plot comparing model confidence against actual outcomes.
 */
export const CalibrationPlot: React.FC<CalibrationPlotProps> = ({
  split,
  data,
  title = "Calibration Reliability Plot",
  height = 260,
  className,
}) => {
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

      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis dataKey="predictedProb" domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            {/* Ideal diagonal line */}
            <ReferenceLine stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} />
            <Line
              type="linear"
              dataKey="observedProb"
              name="Model Calibration"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
