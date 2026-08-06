"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  countUnreadNotifications,
  listNotificationsForUser,
} from "@/lib/data/notifications";

/**
 * A rare read-only Server Action: the notification bell polls this from a
 * Client Component via React Query, which needs a callable function rather
 * than the request-time reads in lib/data used by Server Components.
 */
export async function getNotificationsAction() {
  const user = await requireUser();
  const [notifications, unreadCount] = await Promise.all([
    listNotificationsForUser(user.id),
    countUnreadNotifications(user.id),
  ]);
  return { notifications, unreadCount };
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();
  await db.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}
