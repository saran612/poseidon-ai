import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { ChartBaseProps } from "./chartUtils"
import { Eye, EyeOff } from "lucide-react"

export interface HeatmapCell {
  x: string
  y: string
  value: number
}

export interface HeatmapProps extends ChartBaseProps {
  data: HeatmapCell[]
  xLabels: string[]
  yLabels: string[]
  min?: number
  max?: number
}

/**
 * Clean matrix Heatmap visualizing intensity distributions.
 */
export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  xLabels,
  yLabels,
  min,
  max,
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
        {error ? error : isLoading ? "Loading heatmap..." : "No data available"}
      </div>
    )
  }

  const values = data.map(d => d.value)
  const minValue = min !== undefined ? min : Math.min(...values)
  const maxValue = max !== undefined ? max : Math.max(...values)
  const range = maxValue - minValue || 1

  const getCell = (x: string, y: string) => data.find(d => d.x === x && d.y === y)?.value ?? 0

  return (
    <div
      role="region"
      aria-label={title || "Heatmap"}
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
                <th className="py-2 px-3">Y / X</th>
                {xLabels.map(x => (
                  <th key={x} className="py-2 px-3">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {yLabels.map(y => (
                <tr key={y} className="hover:bg-muted/40">
                  <td className="py-1.5 px-3 font-medium">{y}</td>
                  {xLabels.map(x => (
                    <td key={x} className="py-1.5 px-3">{getCell(x, y)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(36px, 1fr))` }}>
              {/* Top X-Axis Headers */}
              <div />
              {xLabels.map(x => (
                <div key={x} className="text-[10px] font-medium text-muted-foreground text-center truncate px-1">
                  {x}
                </div>
              ))}

              {/* Rows */}
              {yLabels.map(y => (
                <React.Fragment key={y}>
                  <div className="text-[11px] font-medium text-muted-foreground flex items-center pr-2 truncate">
                    {y}
                  </div>
                  {xLabels.map(x => {
                    const val = getCell(x, y)
                    const intensity = Math.min(1, Math.max(0.06, (val - minValue) / range))
                    return (
                      <div
                        key={`${y}-${x}`}
                        title={`${y} × ${x}: ${val}`}
                        className="h-9 rounded-md flex items-center justify-center text-[10px] font-mono tabular-nums transition-colors cursor-pointer select-none"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${intensity})`,
                          color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                        }}
                      >
                        {val}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
