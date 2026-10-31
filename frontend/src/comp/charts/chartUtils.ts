/**
 * Theme chart color resolver. Reads colors from CSS variables at runtime
 * so charts automatically adhere to Apple light/dark design tokens.
 */

export const DEFAULT_CHART_COLORS = [
  "hsl(var(--chart-1, 211 100% 45%))",
  "hsl(var(--chart-2, 142 69% 45%))",
  "hsl(var(--chart-3, 35 95% 50%))",
  "hsl(var(--chart-4, 262 80% 58%))",
  "hsl(var(--chart-5, 190 90% 42%))",
  "hsl(var(--chart-6, 348 83% 55%))",
]

export interface ChartBaseProps {
  title?: string
  description?: string
  ariaLabel?: string
  textSummary?: string
  height?: number
  isLoading?: boolean
  error?: string
  className?: string
}
