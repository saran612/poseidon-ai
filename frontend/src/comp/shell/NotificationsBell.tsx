import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Bell, Check, Inbox } from "lucide-react"

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  unread?: boolean
}

export interface NotificationsBellProps {
  notifications: NotificationItem[]
  onMarkAllAsRead?: () => void
  onSelectNotification?: (id: string) => void
  className?: string
}

/**
 * Notifications bell trigger with unread indicator badge and popover tray.
 */
export const NotificationsBell: React.FC<NotificationsBellProps> = ({
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Notifications, ${unreadCount} unread`}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full border border-border bg-card/80 text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-3 z-50 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="font-semibold text-foreground">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Mark read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border/40 my-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Inbox className="h-6 w-6 text-muted-foreground/60" />
                <span>No new notifications</span>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    onSelectNotification?.(n.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "p-2.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors space-y-0.5",
                    n.unread && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
