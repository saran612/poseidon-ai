import React, { useState } from "react"
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { DEFAULT_CHART_COLORS, ChartBaseProps } from "./chartUtils"
import { Eye, EyeOff } from "lucide-react"

export interface RadarSeries {
  key: string
  label?: string
  color?: string
}

export interface RadarChartProps extends ChartBaseProps {
  data: Record<string, any>[]
  axisKey: string
  series: RadarSeries[]
}

/**
 * Multi-dimensional radar evaluation chart with accessible data alternative.
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  axisKey,
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

  if (isLoading || !data || data.length === 0 || error) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-xs text-muted-foreground", className)} style={{ height }}>
        {error ? error : isLoading ? "Loading chart..." : "No data available"}
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label={title || "Radar Chart"}
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
                <th className="py-2 px-3">{axisKey}</th>
                {series.map(s => (
                  <th key={s.key} className="py-2 px-3">{s.label || s.key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{String(row[axisKey])}</td>
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
            <RechartsRadarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <PolarGrid stroke="hsl(var(--border))" opacity={0.6} />
              <PolarAngleAxis dataKey={axisKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              {series.map((s, idx) => {
                const col = s.color || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]
                return (
                  <Radar
                    key={s.key}
                    name={s.label || s.key}
                    dataKey={s.key}
                    stroke={col}
                    fill={col}
                    fillOpacity={0.25}
                  />
                )
              })}
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
