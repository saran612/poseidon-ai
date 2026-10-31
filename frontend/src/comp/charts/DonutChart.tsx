import React, { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { DEFAULT_CHART_COLORS, ChartBaseProps } from "./chartUtils"
import { Eye, EyeOff } from "lucide-react"

export interface DonutDataItem {
  name: string
  value: number
  color?: string
}

export interface DonutChartProps extends ChartBaseProps {
  data: DonutDataItem[]
  innerRadius?: number
  outerRadius?: number
  centerLabel?: string
  centerValue?: string | number
}

/**
 * Donut chart with centered summary metric readout and accessible table toggle.
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  innerRadius = 60,
  outerRadius = 88,
  centerLabel,
  centerValue,
  title,
  description,
  textSummary,
  height = 280,
  isLoading = false,
  error,
  className,
}) => {
  const [showTable, setShowTable] = useState(false)

  if (isLoading || !data || data.length === 0 || error) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-xs text-muted-foreground", className)} style={{ height }}>
        {error ? error : isLoading ? "Loading chart..." : "No data available"}
      </div>
    )
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div
      role="region"
      aria-label={title || "Donut Chart"}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}
    >
      <div className="flex items-center justify-between">
        <div>
          {title && <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
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

      {textSummary && <p className="sr-only">{textSummary}</p>}

      {showTable ? (
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs tabular-nums text-left">
            <thead className="border-b border-border/60 text-muted-foreground">
              <tr>
                <th className="py-2 px-3">Segment</th>
                <th className="py-2 px-3 text-right">Value</th>
                <th className="py-2 px-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{row.name}</td>
                  <td className="py-1.5 px-3 text-right">{row.value}</td>
                  <td className="py-1.5 px-3 text-right">{total > 0 ? `${((row.value / total) * 100).toFixed(1)}%` : "0%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative" style={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Readout */}
          {(centerValue !== undefined || centerLabel) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              {centerValue !== undefined && (
                <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                  {centerValue}
                </span>
              )}
              {centerLabel && (
                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                  {centerLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
