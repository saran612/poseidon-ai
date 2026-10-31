import React, { useState } from "react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { DEFAULT_CHART_COLORS, ChartBaseProps } from "./chartUtils"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

export interface LineSeries {
  key: string
  label?: string
  color?: string
}

export interface LineChartProps extends ChartBaseProps {
  data: Record<string, any>[]
  xAxisKey: string
  series: LineSeries[]
}

/**
 * Calm Apple-styled timeseries LineChart with accessible table fallback.
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  series,
  title,
  description,
  textSummary,
  height = 280,
  isLoading = false,
  error,
  className,
}) => {
  const [showTable, setShowTable] = useState(false)

  if (error) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-destructive/30 flex items-center gap-3 text-destructive", className)}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-xs">{error}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-border/80 space-y-4 animate-pulse", className)}>
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="w-full bg-muted/40 rounded-xl" style={{ height }} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-xs text-muted-foreground", className)} style={{ height }}>
        No chart data available
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label={title || "Line Chart"}
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
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
          aria-label={showTable ? "Hide data table" : "Show data table view"}
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
                <th className="py-2 px-3">{xAxisKey}</th>
                {series.map(s => (
                  <th key={s.key} className="py-2 px-3">{s.label || s.key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{String(row[xAxisKey])}</td>
                  {series.map(s => (
                    <td key={s.key} className="py-1.5 px-3">{String(row[s.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              {series.map((s, idx) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label || s.key}
                  stroke={s.color || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
