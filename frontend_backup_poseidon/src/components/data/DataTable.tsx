import React, { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Search,
  SlidersHorizontal,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Inbox,
  AlertCircle,
} from "lucide-react"

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  /** Optional custom filter search placeholder */
  searchPlaceholder?: string
  /** Global filter search key (e.g., 'name') */
  searchColumnKey?: string
  /** Export filename for CSV */
  exportFilename?: string
  /** Render expandable row detail content */
  renderExpandedRow?: (row: TData) => React.ReactNode
  /** Loading state indicator */
  isLoading?: boolean
  /** Error message */
  error?: string
  /** Additional custom class */
  className?: string
}

/**
 * Precision TanStack-powered DataTable with sorting, column toggling, pagination, CSV export, and row expansion.
 */
export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search rows...",
  searchColumnKey,
  exportFilename = "data-export.csv",
  renderExpandedRow,
  isLoading = false,
  error,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [showColumnToggle, setShowColumnToggle] = useState(false)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const exportToCsv = () => {
    if (!data.length) return
    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== "select" && col.id !== "expand")
    const headers = visibleColumns.map(col => String(col.columnDef.header || col.id))

    const rows = table.getFilteredRowModel().rows.map(row => {
      return visibleColumns.map(col => {
        const val = row.getValue(col.id)
        if (typeof val === "object" && val !== null) return JSON.stringify(val)
        return `"${String(val ?? "").replace(/"/g, '""')}"`
      }).join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", exportFilename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className={cn("p-6 rounded-2xl bg-card border border-destructive/30 flex items-center gap-3 text-destructive", className)}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-xs">{error}</span>
      </div>
    )
  }

  return (
    <div className={cn("rounded-2xl bg-card border border-border/80 shadow-subtle p-5 space-y-4", className)}>
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={searchPlaceholder}
            value={searchColumnKey ? (table.getColumn(searchColumnKey)?.getFilterValue() as string) ?? "" : globalFilter}
            onChange={e => {
              if (searchColumnKey) {
                table.getColumn(searchColumnKey)?.setFilterValue(e.target.value)
              } else {
                setGlobalFilter(e.target.value)
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Column Visibility Toggle */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle visible columns"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              Columns
            </button>
            {showColumnToggle && (
              <div className="absolute right-0 mt-2 z-50 w-44 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-2 space-y-1 text-xs">
                {table.getAllLeafColumns().map(column => {
                  if (column.id === "select" || column.id === "expand") return null
                  return (
                    <label key={column.id} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded border-border text-primary"
                      />
                      <span className="capitalize">{column.id}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button
            type="button"
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
            aria-label="Export filtered data to CSV"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Export
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground select-none">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <th key={header.id} className="py-2.5 px-3 font-semibold">
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn("flex items-center gap-1.5", canSort && "cursor-pointer select-none hover:text-foreground")}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-muted-foreground/60">
                              {sortDir === "asc" ? (
                                <ChevronUp className="h-3.5 w-3.5 text-primary" />
                              ) : sortDir === "desc" ? (
                                <ChevronDown className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border/40">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading rows...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="h-7 w-7 text-muted-foreground/50" />
                    <span>No records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <React.Fragment key={row.id}>
                  <tr
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      row.getIsSelected() && "bg-primary/5 font-medium"
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-2.5 px-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {/* Expandable row content */}
                  {row.getIsExpanded() && renderExpandedRow && (
                    <tr className="bg-muted/20">
                      <td colSpan={row.getVisibleCells().length} className="p-4 border-b border-border/40">
                        {renderExpandedRow(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md border border-border disabled:opacity-40 hover:bg-muted"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
