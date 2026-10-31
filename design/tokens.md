# Apple-Inspired Dashboard Design Tokens

Restrained, calm, precise visual design tokens modeled after Apple Human Interface Guidelines.

## Typography
- **Font Stack:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, system-ui, -apple-system, sans-serif`
- **Tabular Figures:** `font-feature-settings: "tnum" 1, "cv02" 1` applied to all data, numbers, charts, and metrics.
- **Scale:**
  - `large-title`: `34px` / `41px` line-height / `-0.022em` tracking / font-weight `700`
  - `title`: `22px` / `28px` line-height / `-0.015em` tracking / font-weight `600`
  - `headline`: `17px` / `22px` line-height / `-0.01em` tracking / font-weight `600`
  - `body`: `15px` / `20px` line-height / `-0.005em` tracking / font-weight `400`
  - `callout`: `14px` / `18px` line-height / `0em` tracking / font-weight `400`
  - `footnote`: `13px` / `16px` line-height / `0em` tracking / font-weight `400`
  - `caption`: `11px` / `13px` line-height / `0.01em` tracking / font-weight `500`

## Color Palette

### Light Mode
- `background`: `#ffffff` (Canvas), `#f5f5f7` (Secondary/Grouped background)
- `foreground`: `#1d1d1f`
- `card`: `#ffffff`
- `card-foreground`: `#1d1d1f`
- `muted`: `#f5f5f7`
- `muted-foreground`: `#86868b`
- `border`: `rgba(0, 0, 0, 0.08)` (Hairline border)
- `accent` (System Blue): `#0071e3`
- `accent-foreground`: `#ffffff`
- Semantic Colors:
  - `success` (Green): `#34c759`
  - `warning` (Orange): `#ff9500`
  - `destructive` (Red): `#ff3b30`

### Dark Mode
- `background`: `#000000` (Canvas), `#1c1c1e` (Secondary/Grouped background)
- `foreground`: `#f5f5f7`
- `card`: `#1c1c1e`
- `card-foreground`: `#f5f5f7`
- `muted`: `#2c2c2e`
- `muted-foreground`: `#a1a1a6`
- `border`: `rgba(255, 255, 255, 0.12)` (Hairline border)
- `accent` (System Blue): `#0a84ff`
- `accent-foreground`: `#ffffff`
- Semantic Colors:
  - `success` (Green): `#30d158`
  - `warning` (Orange): `#ff9f0a`
  - `destructive` (Red): `#ff453a`

### Chart Palette (Muted, Harmonious, Colorblind-Safe)
All chart components extract colors dynamically from CSS variables:
- `--chart-1`: Light `hsl(211 100% 45%)` / Dark `hsl(211 100% 52%)` (System Blue)
- `--chart-2`: Light `hsl(142 71% 45%)` / Dark `hsl(142 69% 50%)` (Teal Green)
- `--chart-3`: Light `hsl(38 92% 50%)` / Dark `hsl(38 90% 55%)` (Amber Gold)
- `--chart-4`: Light `hsl(262 83% 58%)` / Dark `hsl(262 80% 65%)` (Purple Indigo)
- `--chart-5`: Light `hsl(190 90% 42%)` / Dark `hsl(190 85% 50%)` (Cyan)
- `--chart-6`: Light `hsl(348 83% 55%)` / Dark `hsl(348 80% 60%)` (Rose Coral)

## Spacing Grid (8pt Baseline)
- `xs`: `4px`
- `sm`: `8px`
- `md`: `16px`
- `lg`: `24px`
- `xl`: `32px`
- `2xl`: `48px`
- `3xl`: `64px`

## Radius & Elevation
- **Card Radius:** `16px` (`1rem`)
- **Pills / Controls:** `9999px` (Full radius)
- **Elevation:** Hairline border (`1px solid var(--border)`) + soft, low-opacity shadow:
  - Light: `0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 4px 12px 0 rgba(0, 0, 0, 0.02)`
  - Dark: `0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 4px 12px 0 rgba(0, 0, 0, 0.2)`

## Surfaces & Backdrop Blur
- Translucent frosted glass effect reserved for Topbar, Sidebar, and floating popovers:
  - `backdrop-blur-md` (`16px`) with `bg-background/80` or `bg-card/75`.

## Motion
- Timing: `150ms` to `250ms` ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Scope: Opacity and transform (translate/scale) only.
- Respects `@media (prefers-reduced-motion: reduce)`.
