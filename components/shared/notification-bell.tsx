"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsAction(),
    refetchInterval: 30_000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  async function handleOpenNotification(notificationId: string, readAt: Date | null) {
    if (!readAt) {
      await markNotificationReadAction(notificationId);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <Badge
              aria-hidden
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs font-normal text-primary hover:underline"
              onClick={async () => {
                await markAllNotificationsReadAction();
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }}
            >
              Mark all read
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => {
            const content = (
              <div className="flex flex-col gap-0.5 py-1">
                <div className="flex items-center gap-2">
                  {!notification.readAt ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="size-1.5 shrink-0" />
                  )}
                  <span className="text-sm font-medium">{notification.title}</span>
                </div>
                {notification.body ? (
                  <p className="pl-3.5 text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                ) : null}
              </div>
            );

            return (
              <DropdownMenuItem
                key={notification.id}
                asChild={!!notification.link}
                onSelect={() =>
                  handleOpenNotification(notification.id, notification.readAt)
                }
              >
                {notification.link ? (
                  <Link href={notification.link}>{content}</Link>
                ) : (
                  content
                )}
              </DropdownMenuItem>
            );
          })}
          {notifications.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
