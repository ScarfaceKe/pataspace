import type { PropertyCategoryId, UserRoleId } from './types';

export type NotificationStatus = 'unread' | 'read';
export type NotificationPriority = 'low' | 'normal' | 'high';
export type NotificationDeliveryChannel = 'in-app' | 'whatsapp';
export type NotificationPreferenceChannel = NotificationDeliveryChannel | 'email';
export type NotificationAudience = 'customer' | 'property-contact' | 'platform-admin';

export type NotificationEventType =
  | 'account-registration'
  | 'welcome-message'
  | 'property-matched'
  | 'property-unlock-confirmation'
  | 'verified-access-activation'
  | 'verified-access-expiry-reminder'
  | 'viewing-request-submitted'
  | 'viewing-request-accepted'
  | 'viewing-request-declined'
  | 'viewing-request-rescheduled'
  | 'viewing-booking-confirmed'
  | 'viewing-24-hour-reminder'
  | 'viewing-1-hour-reminder'
  | 'viewing-reminder'
  | 'viewing-completed'
  | 'viewing-cancellation'
  | 'viewing-cancelled'
  | 'viewing-schedule'
  | 'urgent-viewing-reminder'
  | 'missed-viewing-alert'
  | 'customer-arrived'
  | 'property-availability-change'
  | 'property-unavailable'
  | 'review-invitation'
  | 'review-response-received'
  | 'payment-successful'
  | 'payment-confirmation'
  | 'payment-failed'
  | 'receipt-available'
  | 'profile-update'
  | 'saved-search-update'
  | 'new-recommendation'
  | 'general-announcement'
  | 'new-property-registration'
  | 'new-enquiry'
  | 'property-verification-update'
  | 'property-review-received'
  | 'new-review'
  | 'listing-about-to-expire'
  | 'listing-expired'
  | 'property-performance'
  | 'dashboard-alert'
  | 'dashboard-reminder'
  | 'weekly-summary'
  | 'daily-task-list'
  | 'customer-response-to-viewing'
  | 'vacancy-confirmation-reminder'
  | 'daily-vacancy-verification-reminder'
  | 'daily-vacancy-verification-failure'
  | 'property-status-update'
  | 'property-successfully-rented'
  | 'registration-approval-or-correction-request'
  | 'assigned-properties'
  | 'assigned-viewings'
  | 'performance-update'
  | 'successful-property-verification'
  | 'verification-issues-requiring-attention'
  | 'daily-vacancy-confirmation-reminder'
  | 'account-update'
  | 'security-alert'
  | 'high-priority-security-alert'
  | 'system-outage'
  | 'failed-payment-system'
  | 'critical-platform-error'
  | 'platform-analytics'
  | 'user-growth'
  | 'revenue-report'
  | 'security-dashboard'
  | 'operational-report'
  | 'platform-announcement';

export interface NotificationRelatedEntity {
  propertyId?: string;
  unitIdentifier?: string;
  propertyCategory?: PropertyCategoryId;
  viewingId?: string;
  paymentId?: string;
  reviewId?: string;
}

export interface NotificationChannelPreferences {
  inApp: boolean;
  whatsapp: boolean;
  email: boolean;
}

export interface PataSpaceNotification {
  id: string;
  recipientUserId: string;
  recipientRole: UserRoleId;
  audience: NotificationAudience;
  eventType: NotificationEventType;
  eventKey: string;
  title: string;
  shortDescription: string;
  related: NotificationRelatedEntity;
  priority: NotificationPriority;
  status: NotificationStatus;
  centreCategory?: import('./notification-centre').NotificationCentreCategory;
  channels: NotificationDeliveryChannel[];
  createdAt: string;
  readAt?: string;
  deletedAt?: string;
}

export const DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES: NotificationChannelPreferences = {
  inApp: true,
  whatsapp: true,
  email: false
};

export const CUSTOMER_IN_APP_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'welcome-message',
  'account-registration',
  'property-matched',
  'property-unavailable',
  'property-availability-change',
  'payment-confirmation',
  'payment-successful',
  'profile-update',
  'saved-search-update',
  'new-recommendation',
  'general-announcement',
  'property-unlock-confirmation',
  'verified-access-activation',
  'verified-access-expiry-reminder',
  'payment-failed',
  'receipt-available',
  'review-invitation',
  'review-response-received',
  'viewing-request-submitted',
  'viewing-completed'
] as const;

export const PROPERTY_OWNER_IN_APP_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'new-enquiry',
  'new-review',
  'property-review-received',
  'listing-about-to-expire',
  'listing-expired',
  'property-performance',
  'dashboard-alert',
  'new-property-registration',
  'property-verification-update',
  'property-status-update',
  'registration-approval-or-correction-request'
] as const;

export const PROPERTY_MANAGER_IN_APP_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'new-enquiry',
  'viewing-schedule',
  'dashboard-reminder',
  'weekly-summary',
  'daily-task-list',
  'vacancy-confirmation-reminder',
  'property-status-update',
  'viewing-request-submitted',
  'viewing-cancellation',
  'viewing-request-rescheduled'
] as const;

export const LEASING_AGENT_IN_APP_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'assigned-properties',
  'assigned-viewings',
  'customer-enquiries',
  'new-enquiry',
  'performance-update',
  'viewing-schedule',
  'viewing-cancellation'
] as readonly NotificationEventType[];

export const FOUNDER_IN_APP_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'platform-analytics',
  'user-growth',
  'revenue-report',
  'security-dashboard',
  'operational-report',
  'successful-property-verification',
  'verification-issues-requiring-attention',
  'account-update',
  'security-alert',
  'platform-announcement'
] as const;

export const WHATSAPP_IMPORTANT_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  // Customer — only immediate viewing attention events.
  'viewing-booking-confirmed',
  'viewing-24-hour-reminder',
  'viewing-1-hour-reminder',
  'viewing-cancelled',
  'viewing-cancellation',
  'viewing-request-rescheduled',
  // Property Owner.
  'viewing-request-submitted',
  'viewing-booking-confirmed',
  'property-successfully-rented',
  // Property Manager.
  'daily-vacancy-verification-reminder',
  'daily-vacancy-confirmation-reminder',
  'urgent-viewing-reminder',
  'missed-viewing-alert',
  // Leasing Agent.
  'viewing-schedule',
  'customer-arrived',
  // Founder.
  'high-priority-security-alert',
  'security-alert',
  'system-outage',
  'failed-payment-system',
  'daily-vacancy-verification-failure',
  'critical-platform-error'
] as const;

export const WHATSAPP_EXCLUDED_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [
  'new-enquiry',
  'dashboard-alert',
  'dashboard-reminder',
  'payment-successful',
  'payment-confirmation',
  'account-registration',
  'welcome-message',
  'new-property-registration',
  'platform-analytics',
  'user-growth',
  'revenue-report',
  'property-matched',
  'saved-search-update',
  'new-recommendation'
] as const;

export const NOTIFICATION_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  primaryChannel: 'in-app',
  allowedChannels: ['in-app', 'whatsapp'] as const,
  emailNotificationsAllowed: false,
  philosophy: {
    meaningfulValueOnly: true,
    avoidUnnecessaryOrRepetitiveNotifications: true,
    duplicateNotificationsForSameEventNeverSent: true,
    whatsappReservedForImmediateAttention: true,
    inAppDefaultForRoutineUpdates: true
  },
  userNotificationControls: {
    settingsLocation: 'Settings → Notifications',
    inAppNotificationsToggle: true,
    whatsappNotificationsToggle: true,
    emailNotificationsTogglePreparedForFutureApprovalOnly: true
  },
  notificationCentreFields: ['Notification Title', 'Short Description', 'Related Property or Unit', 'Date and Time', 'Read / Unread Status'] as const,
  userActions: ['Open notifications', 'Mark notification as read', 'Mark all notifications as read', 'Delete individual notifications'] as const,
  readStatuses: ['unread', 'read'] as const,
  highPriorityExamples: ['Successful payments', 'Viewing requests', 'Viewing schedule changes', 'Verified Access expiry', 'Property verification decisions', 'Security alerts', 'Viewing confirmations', 'Viewing reminders', 'Viewing cancellations', 'Operational reminders', 'System outages'] as const,
  security: {
    customersOnlyOwnActivities: true,
    propertyContactsOnlyManagedProperties: true,
    platformAdminsOnlyAuthorisedPlatformNotifications: true
  },
  aiAdminAssistant: {
    monitorsFailedNotifications: true,
    detectsDuplicateNotifications: true,
    detectsDelayedNotifications: true,
    detectsDeliveryIssues: true,
    assistsAdminsWithoutInterruptingOperations: true
  },
  integrations: [
    'Authentication', 'Property Registration', 'Property Verification', 'House Match', 'Shop Match', 'Office Match', 'Event Hall Match', 'Unlock This Listing', 'Verified Access', 'Payment System', 'Viewing Workflow', 'Reviews & Ratings', 'Customer Accounts', 'AI Admin Assistant'
  ] as const
} as const;

export const CUSTOMER_NOTIFICATION_EVENTS = CUSTOMER_IN_APP_NOTIFICATION_EVENTS;
export const PROPERTY_CONTACT_NOTIFICATION_EVENTS: readonly NotificationEventType[] = [...PROPERTY_OWNER_IN_APP_NOTIFICATION_EVENTS, ...PROPERTY_MANAGER_IN_APP_NOTIFICATION_EVENTS, ...LEASING_AGENT_IN_APP_NOTIFICATION_EVENTS] as const;
export const PLATFORM_NOTIFICATION_EVENTS = FOUNDER_IN_APP_NOTIFICATION_EVENTS;

export function getDefaultNotificationPriority(eventType: NotificationEventType): NotificationPriority {
  if (WHATSAPP_IMPORTANT_NOTIFICATION_EVENTS.includes(eventType) || ['payment-failed', 'verified-access-expiry-reminder', 'property-verification-update', 'successful-property-verification', 'verification-issues-requiring-attention'].includes(eventType)) return 'high';
  if (['platform-announcement', 'account-update', 'general-announcement', 'profile-update', 'saved-search-update'].includes(eventType)) return 'low';
  return 'normal';
}

export function notificationCanUseWhatsApp(eventType: NotificationEventType): boolean {
  return WHATSAPP_IMPORTANT_NOTIFICATION_EVENTS.includes(eventType) && !WHATSAPP_EXCLUDED_NOTIFICATION_EVENTS.includes(eventType);
}

export function resolveNotificationChannels(eventType: NotificationEventType, preferences: NotificationChannelPreferences = DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES): NotificationDeliveryChannel[] {
  const channels: NotificationDeliveryChannel[] = [];
  if (preferences.inApp) channels.push('in-app');
  if (preferences.whatsapp && notificationCanUseWhatsApp(eventType)) channels.push('whatsapp');
  return channels.length ? channels : ['in-app'];
}
