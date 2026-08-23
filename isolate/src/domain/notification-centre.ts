import type { NotificationEventType, PataSpaceNotification } from './notifications';

export type NotificationCentreCategory =
  | 'property-matches'
  | 'viewing-requests'
  | 'viewing-reminders'
  | 'property-activity'
  | 'platform-updates'
  | 'account-notifications';
export type ExtendedNotificationStatus = 'new' | 'read' | 'unread' | 'delivered' | 'archived';

export interface NotificationDeliveryTracking {
  notificationId: string;
  createdAt: string;
  deliveredAt?: string;
  openedAt?: string;
  readAt?: string;
  failedAttempts: number;
  recovered: boolean;
}

export interface NotificationHistoryFilter {
  userId: string;
  category?: NotificationCentreCategory;
  query?: string;
}

export interface FounderCommunicationAnalytics {
  notificationsSent: number;
  notificationsDelivered: number;
  deliverySuccessRate: string;
  failedDeliveries: number;
  aiNotificationGroupingPerformance: string;
  notificationRecoveryPerformance: string;
  criticalNotificationHistory: PataSpaceNotification[];
}

export interface CommunicationAnalyticsInsight {
  notificationDeliveryReliability: string;
  customerInteractionWithNotifications: string;
  notificationUsefulness: string;
  groupingEffectiveness: string;
  recoveryPerformance: string;
}

export const NOTIFICATION_CENTRE_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  inAppNotificationCentreForEveryUser: true,
  categories: ['Property Matches', 'Viewing Requests', 'Viewing Reminders', 'Property Activity', 'Platform Updates', 'Account Notifications'] as const,
  chronologicalNewestFirst: true,
  statuses: ['New', 'Read', 'Unread', 'Delivered', 'Archived'] as const,
  history: {
    completeNotificationHistoryForEveryUser: true,
    canViewPreviousNotifications: true,
    canOpenOlderNotifications: true,
    canSearchNotificationHistory: true,
    canFilterByCategory: true
  },
  aiCommunicationIntelligence: {
    decidesImmediate: true,
    decidesGrouped: true,
    decidesNotSentWhenLowValue: true,
    maximisesUsefulnessMinimisesInterruptions: true
  },
  smartGrouping: {
    groupsRelatedEventsWithinShortPeriod: true,
    improvesClarityWithoutDelayingImportantInformation: true,
    exampleTitle: 'PataSpace Update'
  },
  immediateNotifications: ['Viewing starting soon', 'Property became inactive', 'Critical Founder alerts', 'Critical security notifications'] as const,
  deliveryTracking: ['Notification created', 'Notification delivered', 'Notification opened', 'Notification read'] as const,
  failedNotificationRecovery: {
    retryDelivery: true,
    recoverTemporaryFailures: true,
    restoreNotificationQueues: true,
    routineRecoverySilent: true,
    repeatedCustomerImpactingFailuresEscalated: true
  },
  viewingCommunication: ['New Viewing Request', 'Viewing Approved', 'Viewing Rescheduled', 'Viewing Cancelled', 'Upcoming Viewing Reminder'] as const,
  founderCommunicationAnalytics: ['Notifications Sent', 'Notifications Delivered', 'Delivery Success Rate', 'Failed Deliveries', 'AI Notification Grouping Performance', 'Notification Recovery Performance', 'Critical Notification History'] as const,
  aiLearning: {
    mayImproveGrouping: true,
    mayImproveTiming: true,
    mayImproveCommunicationQuality: true,
    mayImproveDeliveryReliability: true,
    mustNeverSendMarketingSpam: true,
    mustNeverIgnoreFounderRules: true,
    mustNeverChangeCustomerAccessControl: true,
    mustNeverModifyBusinessRules: true
  },
  security: {
    neverExposeProtectedContactInformation: true,
    neverExposeLockedPropertyInformation: true,
    neverExposePremiumContent: true,
    neverExposePrivateCustomerInformation: true,
    customerAccessControlStandardRespected: true
  }
} as const;

export function categorizeNotification(eventType: NotificationEventType): NotificationCentreCategory {
  if (eventType === 'property-availability-change') return 'property-matches';
  if (eventType.includes('viewing-request')) return 'viewing-requests';
  if (eventType === 'viewing-reminder') return 'viewing-reminders';
  if (eventType.includes('property') || eventType.includes('vacancy')) return 'property-activity';
  if (eventType.includes('account') || eventType.includes('security')) return 'account-notifications';
  return 'platform-updates';
}
