import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, X, Edit3 } from "lucide-react"

export interface ReviewControlsProps {
  onApprove: () => void
  onReject: (reason?: string) => void
  onCorrect: (correction: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Human-in-the-loop AI evaluation review controls (Approve, Reject, Correct).
 */
export const ReviewControls: React.FC<ReviewControlsProps> = ({
  onApprove,
  onReject,
  onCorrect,
  disabled = false,
  className,
}) => {
  const [isEditingCorrection, setIsEditingCorrection] = useState(false)
  const [correctionText, setCorrectionText] = useState("")

  const submitCorrection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!correctionText.trim()) return
    onCorrect(correctionText.trim())
    setIsEditingCorrection(false)
    setCorrectionText("")
  }

  return (
    <div className={cn("p-4 rounded-2xl bg-card border border-border/80 shadow-subtle space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Human Evaluation Review</span>
        <span className="text-[10px] uppercase font-mono text-muted-foreground">HITL Validation</span>
      </div>

      {isEditingCorrection ? (
        <form onSubmit={submitCorrection} className="space-y-2">
          <textarea
            value={correctionText}
            onChange={e => setCorrectionText(e.target.value)}
            placeholder="Enter gold standard correction..."
            className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsEditingCorrection(false)}
              className="px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium"
            >
              Save Correction
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onApprove}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium bg-success/10 hover:bg-success/20 text-success transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Approve</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onReject()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reject</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsEditingCorrection(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium border border-border hover:bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Correct</span>
          </button>
        </div>
      )}
    </div>
  )
}
