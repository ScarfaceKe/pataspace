import type { NotificationEventType } from './notifications';
import { notificationCanUseWhatsApp } from './notifications';
import type { UserRoleId } from './types';

export type WhatsAppDeliveryStatus = 'queued' | 'configuration-pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'retry-scheduled' | 'duplicate' | 'cancelled';

export interface WhatsAppNotificationPreferences {
  userId: string;
  primaryPhoneNumber: string;
  whatsappSameAsPrimary: boolean;
  whatsappPhoneNumber?: string;
  inAppNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
}

export interface WhatsAppDeliveryRequest {
  notificationId?: string;
  recipientUserId: string;
  recipientRole: UserRoleId;
  eventType: NotificationEventType;
  destinationPhoneNumber: string;
  title: string;
  shortDescription: string;
  idempotencyKey: string;
}

export function normaliseWhatsAppPhoneNumber(phoneNumber: string): string | null {
  const compact = phoneNumber.replace(/[\s()-]/g, '');
  if (/^254[17]\d{8}$/.test(compact)) return compact;
  if (/^\+254[17]\d{8}$/.test(compact)) return compact.slice(1);
  if (/^0[17]\d{8}$/.test(compact)) return `254${compact.slice(1)}`;
  return null;
}

export function shouldSendWhatsAppNotification(eventType: NotificationEventType, preferences: { whatsappNotificationsEnabled: boolean }): boolean {
  return preferences.whatsappNotificationsEnabled && notificationCanUseWhatsApp(eventType);
}

export function buildWhatsAppMessage(input: { title: string; shortDescription: string }): string {
  return `PataSpace: ${input.title}\n\n${input.shortDescription}`.slice(0, 1000);
}
