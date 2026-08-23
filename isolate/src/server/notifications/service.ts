import { randomUUID } from 'node:crypto';
import { getDefaultNotificationPriority, resolveNotificationChannels, type NotificationAudience, type NotificationEventType, type NotificationRelatedEntity, type PataSpaceNotification } from '@/domain/notifications';
import type { UserRoleId } from '@/domain/types';
import { queueImportantWhatsAppNotification } from '@/server/whatsapp/service';
import { readNotificationStore, writeNotificationStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function createNotification(input: {
  recipientUserId: string;
  recipientRole: UserRoleId;
  audience: NotificationAudience;
  eventType: NotificationEventType;
  eventKey: string;
  title: string;
  shortDescription: string;
  related?: NotificationRelatedEntity;
  priority?: PataSpaceNotification['priority'];
}): Promise<PataSpaceNotification> {
  const data = await readNotificationStore();
  const existing = data.notifications.find((item) => item.recipientUserId === input.recipientUserId && item.eventKey === input.eventKey && !item.deletedAt);
  if (existing) return existing;
  const notification: PataSpaceNotification = {
    id: randomUUID(),
    recipientUserId: input.recipientUserId,
    recipientRole: input.recipientRole,
    audience: input.audience,
    eventType: input.eventType,
    eventKey: input.eventKey,
    title: input.title,
    shortDescription: input.shortDescription,
    related: input.related ?? {},
    priority: input.priority ?? getDefaultNotificationPriority(input.eventType),
    status: 'unread',
    channels: resolveNotificationChannels(input.eventType),
    createdAt: nowIso()
  };
  data.notifications.push(notification);
  await writeNotificationStore(data);
  if (notification.channels.includes('whatsapp')) {
    await queueImportantWhatsAppNotification({
      notificationId: notification.id,
      recipientUserId: notification.recipientUserId,
      recipientRole: notification.recipientRole,
      eventType: notification.eventType,
      destinationPhoneNumber: '',
      title: notification.title,
      shortDescription: notification.shortDescription,
      idempotencyKey: `whatsapp:${notification.eventKey}`
    });
  }
  return notification;
}

export async function listNotifications(userId: string): Promise<PataSpaceNotification[]> {
  const data = await readNotificationStore();
  return data.notifications.filter((item) => item.recipientUserId === userId && !item.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<PataSpaceNotification | null> {
  const data = await readNotificationStore();
  const notification = data.notifications.find((item) => item.id === notificationId && item.recipientUserId === userId && !item.deletedAt);
  if (!notification) return null;
  notification.status = 'read';
  notification.readAt = nowIso();
  await writeNotificationStore(data);
  return notification;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const data = await readNotificationStore();
  let count = 0;
  for (const notification of data.notifications) {
    if (notification.recipientUserId === userId && !notification.deletedAt && notification.status === 'unread') {
      notification.status = 'read';
      notification.readAt = nowIso();
      count += 1;
    }
  }
  await writeNotificationStore(data);
  return count;
}

export async function deleteNotification(userId: string, notificationId: string): Promise<boolean> {
  const data = await readNotificationStore();
  const notification = data.notifications.find((item) => item.id === notificationId && item.recipientUserId === userId && !item.deletedAt);
  if (!notification) return false;
  notification.deletedAt = nowIso();
  await writeNotificationStore(data);
  return true;
}

export async function createSystemNotificationForAdmin(input: { adminUserId: string; eventType: NotificationEventType; eventKey: string; title: string; shortDescription: string; related?: NotificationRelatedEntity }) {
  return createNotification({ recipientUserId: input.adminUserId, recipientRole: 'platform-admin', audience: 'platform-admin', eventType: input.eventType, eventKey: input.eventKey, title: input.title, shortDescription: input.shortDescription, related: input.related });
}
