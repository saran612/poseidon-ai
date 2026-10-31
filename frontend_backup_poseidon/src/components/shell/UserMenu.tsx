import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { LogOut, Settings } from "lucide-react"

export interface UserMenuProps {
  user: {
    name: string
    email: string
    avatarUrl?: string
    role?: string
  }
  onSignOut?: () => void
  onOpenSettings?: () => void
  className?: string
}

/**
 * Translucent popover user account menu.
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onSignOut,
  onOpenSettings,
  className,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-border">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User Account Menu"
          className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl p-2 z-50 text-xs"
        >
          <div className="px-3 py-2 border-b border-border/60">
            <p className="font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">
                {user.role}
              </span>
            )}
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onOpenSettings?.()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted text-left transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              Account Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSignOut?.()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 text-left transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
