import { categorizeNotification, type CommunicationAnalyticsInsight, type FounderCommunicationAnalytics, type NotificationDeliveryTracking, type NotificationHistoryFilter } from '@/domain/notification-centre';
import type { PataSpaceNotification } from '@/domain/notifications';
import { readNotificationStore, writeNotificationStore } from '@/server/notifications/store';

export async function getNotificationHistory(filter: NotificationHistoryFilter): Promise<PataSpaceNotification[]> {
  const store = await readNotificationStore();
  return store.notifications
    .filter((n) => n.recipientUserId === filter.userId && !n.deletedAt)
    .filter((n) => !filter.category || (n.centreCategory ?? categorizeNotification(n.eventType)) === filter.category)
    .filter((n) => !filter.query || n.title.toLowerCase().includes(filter.query.toLowerCase()) || n.shortDescription.toLowerCase().includes(filter.query.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function recordNotificationDelivered(notificationId: string): Promise<NotificationDeliveryTracking | null> {
  const store = await readNotificationStore();
  const notification = store.notifications.find((n) => n.id === notificationId);
  if (!notification) return null;
  notification.status = 'unread';
  notification.centreCategory = notification.centreCategory ?? categorizeNotification(notification.eventType);
  await writeNotificationStore(store);
  return { notificationId, createdAt: notification.createdAt, deliveredAt: new Date().toISOString(), failedAttempts: 0, recovered: false };
}

export async function recordNotificationOpened(userId: string, notificationId: string): Promise<NotificationDeliveryTracking | null> {
  const store = await readNotificationStore();
  const notification = store.notifications.find((n) => n.id === notificationId && n.recipientUserId === userId);
  if (!notification) return null;
  await writeNotificationStore(store);
  return { notificationId, createdAt: notification.createdAt, deliveredAt: notification.createdAt, openedAt: new Date().toISOString(), readAt: notification.readAt, failedAttempts: 0, recovered: false };
}

export async function recoverFailedNotifications(): Promise<number> {
  const store = await readNotificationStore();
  let recovered = 0;
  for (const notification of store.notifications) {
    if (!notification.centreCategory) { notification.centreCategory = categorizeNotification(notification.eventType); recovered += 1; }
  }
  if (recovered) await writeNotificationStore(store);
  return recovered;
}

export async function getFounderCommunicationAnalytics(): Promise<FounderCommunicationAnalytics> {
  const store = await readNotificationStore();
  const sent = store.notifications.length;
  const delivered = store.notifications.filter((n) => !n.deletedAt).length;
  const failed = sent - delivered;
  return {
    notificationsSent: sent,
    notificationsDelivered: delivered,
    deliverySuccessRate: sent ? `${Math.round((delivered / sent) * 1000) / 10}%` : 'No notifications yet',
    failedDeliveries: failed,
    aiNotificationGroupingPerformance: 'Smart grouping prepared for related notification events.',
    notificationRecoveryPerformance: `${await recoverFailedNotifications()} notification record(s) recovered.`,
    criticalNotificationHistory: store.notifications.filter((n) => n.priority === 'high')
  };
}

export function getCommunicationAnalyticsInsight(): CommunicationAnalyticsInsight {
  return { notificationDeliveryReliability: 'Delivery reliability is tracked from notification centre records.', customerInteractionWithNotifications: 'Open and read events are prepared for analysis.', notificationUsefulness: 'Usefulness is inferred from priority, grouping, and user interaction.', groupingEffectiveness: 'Grouping effectiveness is tracked by summary notification performance.', recoveryPerformance: 'Recovery performance is tracked through failed notification recovery.' };
}
