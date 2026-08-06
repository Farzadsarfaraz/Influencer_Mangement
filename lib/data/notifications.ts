import "server-only";

import { db } from "@/lib/db";

export async function listNotificationsForUser(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function countUnreadNotifications(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}
