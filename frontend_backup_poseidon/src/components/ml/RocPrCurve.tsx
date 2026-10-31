import React, { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface CurvePoint {
  fpr?: number
  tpr?: number
  recall?: number
  precision?: number
}

export interface RocPrCurveProps {
  /** Dataset split (Required) */
  split: string
  /** Curve type */
  type?: "ROC" | "PR"
  /** Calculated Area Under Curve */
  auc?: number
  data: CurvePoint[]
  height?: number
  className?: string
}

/**
 * ROC and Precision-Recall evaluation curve with required split tag and accessible table view.
 */
export const RocPrCurve: React.FC<RocPrCurveProps> = ({
  split,
  type = "ROC",
  auc,
  data,
  height = 260,
  className,
}) => {
  const [showTable, setShowTable] = useState(false)

  const isRoc = type === "ROC"
  const xKey = isRoc ? "fpr" : "recall"
  const yKey = isRoc ? "tpr" : "precision"
  const xLabel = isRoc ? "False Positive Rate" : "Recall"
  const yLabel = isRoc ? "True Positive Rate" : "Precision"

  return (
    <div
      role="region"
      aria-label={`${type} Curve on ${split}`}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">{type} Curve</h4>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Prototype
            </span>
            {auc !== undefined && (
              <span className="text-xs font-mono font-semibold text-primary tabular-nums">
                AUC: {auc.toFixed(3)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Split: <span className="font-mono font-medium text-foreground">{split}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
        >
          {showTable ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{showTable ? "Chart" : "Table"}</span>
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto max-h-60">
          <table className="w-full text-xs tabular-nums text-left">
            <thead className="border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="py-2 px-3">{xLabel}</th>
                <th className="py-2 px-3">{yLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{String((row as any)[xKey])}</td>
                  <td className="py-1.5 px-3">{String((row as any)[yKey])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis dataKey={xKey} type="number" domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
