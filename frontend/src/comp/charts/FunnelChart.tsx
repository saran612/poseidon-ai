import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { DEFAULT_CHART_COLORS, ChartBaseProps } from "./chartUtils"
import { Eye, EyeOff } from "lucide-react"

export interface FunnelStage {
  stage: string
  count: number
}

export interface FunnelChartProps extends ChartBaseProps {
  data: FunnelStage[]
  color?: string
}

/**
 * Clean multi-tier conversion FunnelChart.
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  color,
  title,
  description,
  textSummary,
  isLoading = false,
  error,
  className,
}) => {
  const [showTable, setShowTable] = useState(false)

  if (isLoading || !data || data.length === 0 || error) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-xs text-muted-foreground", className)}>
        {error ? error : isLoading ? "Loading chart..." : "No data available"}
      </div>
    )
  }

  const baseCount = data[0]?.count || 1

  return (
    <div
      role="region"
      aria-label={title || "Funnel Chart"}
      className={cn("p-5 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-4", className)}
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
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3 text-right">Count</th>
                <th className="py-2 px-3 text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{row.stage}</td>
                  <td className="py-1.5 px-3 text-right">{row.count.toLocaleString()}</td>
                  <td className="py-1.5 px-3 text-right">{((row.count / baseCount) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((stage, idx) => {
            const ratio = (stage.count / baseCount) * 100
            const stageColor = color || DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">{stage.stage}</span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-foreground">{stage.count.toLocaleString()}</span>
                    <span className="text-[11px] text-muted-foreground">({ratio.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-apple"
                    style={{ width: `${ratio}%`, backgroundColor: stageColor }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
