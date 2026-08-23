import type { PropertyCategoryId, UserRoleId } from './types';

export type CommunicationChannel = 'in-app' | 'whatsapp';
export type CommunicationPriority = 'high' | 'medium' | 'low';
export type CustomerNotificationPreferenceCategory = 'new-matching-properties' | 'viewing-reminders';

export interface CustomerNotificationPreferences {
  customerId: string;
  newMatchingProperties: boolean;
  viewingReminders: boolean;
  inAppNotifications: boolean;
  whatsappNotifications: boolean;
  emailNotifications: boolean;
  deliveryChannelsSelectableByCustomer: true;
  emailDeliveryPreparedForFutureApprovalOnly: true;
  updatedAt: string;
}

export interface WhatsAppMessagePreparation {
  propertyCategory: PropertyCategoryId;
  propertySummary: string;
  propertyReferenceOrUnitIdentifier: string;
  politeIntroduction: string;
  requestText: string;
  customerMayEditBeforeSending: true;
  preparedMessage: string;
}

export interface NotificationPriorityClassification {
  priority: CommunicationPriority;
  deliverImmediately: boolean;
  mayBeGrouped: boolean;
  usedSparingly: boolean;
}

export interface IntelligentNotificationSummary {
  title: 'PataSpace Update';
  groupedMessages: string[];
  reducesInterruptions: true;
  preservesImportantInformation: true;
}

export const COMMUNICATION_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  philosophy: [
    'Notify users only when necessary',
    'Never spam users',
    'Prioritize meaningful communication',
    'Combine related notifications whenever appropriate',
    'Respect the Invisible Intelligence Principle',
    'Keep communication simple, timely, and relevant'
  ] as const,
  channels: {
    standardNotifications: ['in-app'] as const,
    criticalNotifications: ['in-app', 'whatsapp'] as const,
    emailNotificationsAllowed: false,
    customerMayChooseDeliveryChannels: true
  },
  customerPreferences: {
    configurableCategories: ['new-matching-properties', 'viewing-reminders'] as const,
    customersMayEnableOrDisableCategories: true,
    customersMayChooseDeliveryChannels: true,
    channelToggles: ['in-app notifications', 'whatsapp notifications', 'email notifications (future approval only)'] as const
  },
  propertyContactNotifications: {
    delivered: ['New Viewing Request', 'Daily Vacancy Confirmation Reminder', 'Property Became Inactive'] as const,
    notDelivered: [
      'Every Unlock This Listing purchase',
      'Every Verified Access purchase',
      'Every customer search',
      'Every property view',
      'Every minor platform event'
    ] as const,
    avoidsNotificationFatigue: true
  },
  founderNotifications: {
    routineOperationsRemainInvisibleWhenAiManagesThem: true,
    receivesOnly: [
      'Critical platform incidents',
      'Security incidents',
      'Platform outages',
      'Critical payment failures',
      'AI investigations requiring Founder approval',
      'Other Founder-approved critical operational events'
    ] as const,
    criticalChannels: ['Founder Dashboard', 'WhatsApp'] as const
  },
  customerCommunicationWorkflow: {
    customerAccessControlUnchanged: true,
    communicationAvailableOnlyAfterUnlockOrVerifiedAccess: true,
    afterAccessMayCall: true,
    afterAccessMayWhatsApp: true,
    afterAccessMayRequestViewing: true,
    noCommunicationBeforeSuccessfulAccessPurchase: true
  },
  priorityLevels: {
    high: ['Viewing starting soon', 'Property became inactive', 'Critical Founder alerts'] as const,
    medium: ['New Matching Property', 'Viewing Reminder', 'Daily Vacancy Confirmation Reminder', 'New Viewing Request'] as const,
    low: ['Platform announcements', 'Educational platform tips', 'Feature information approved by the Founder'] as const
  },
  notificationTiming: {
    aiDecidesImmediateOrSummary: true,
    noDailyGreetingsWithoutMeaningfulActivity: true,
    ifNothingImportantNoNotificationSent: true
  },
  customerExperience: ['Clear', 'Relevant', 'Timely', 'Easy to understand', 'Encourage meaningful platform engagement'] as const,
  security: {
    neverExposeProtectedInfoBeforeAccess: true,
    protectedContactInformationRemainsSecure: true,
    premiumPropertyInformationRemainsSecure: true,
    restrictedPlatformDataRemainsSecure: true
  },
  integrations: [
    'Authentication',
    'Customer Dashboard',
    'Property Registration',
    'Property Verification',
    'House Match',
    'Shop Match',
    'Office Match',
    'Event Hall Match',
    'Unlock This Listing',
    'Verified Access',
    'Viewing Workflow',
    'Notifications',
    'AI Admin Assistant',
    'Founder Dashboard',
    'Platform Health Monitor'
  ] as const
} as const;

export function classifyNotificationPriority(eventLabel: string): NotificationPriorityClassification {
  const lower = eventLabel.toLowerCase();
  const isHigh = lower.includes('critical') || lower.includes('starting soon') || lower.includes('inactive') || lower.includes('security');
  const isMedium = lower.includes('viewing') || lower.includes('matching') || lower.includes('vacancy');
  if (isHigh) return { priority: 'high', deliverImmediately: true, mayBeGrouped: false, usedSparingly: false };
  if (isMedium) return { priority: 'medium', deliverImmediately: false, mayBeGrouped: true, usedSparingly: false };
  return { priority: 'low', deliverImmediately: false, mayBeGrouped: true, usedSparingly: true };
}

export function prepareWhatsAppMessage(input: Omit<WhatsAppMessagePreparation, 'politeIntroduction' | 'requestText' | 'customerMayEditBeforeSending' | 'preparedMessage'>): WhatsAppMessagePreparation {
  const politeIntroduction = 'Hello, I found this property on PataSpace and I am interested.';
  const requestText = 'Please share more information or help me arrange a viewing where appropriate.';
  const preparedMessage = `${politeIntroduction}\n\nProperty: ${input.propertySummary}\nCategory: ${input.propertyCategory}\nReference: ${input.propertyReferenceOrUnitIdentifier}\n\n${requestText}`;
  return { ...input, politeIntroduction, requestText, customerMayEditBeforeSending: true, preparedMessage };
}

export function buildIntelligentNotificationSummary(messages: string[]): IntelligentNotificationSummary | null {
  const meaningful = messages.filter(Boolean);
  if (!meaningful.length) return null;
  return { title: 'PataSpace Update', groupedMessages: meaningful, reducesInterruptions: true, preservesImportantInformation: true };
}

export function canSendCommunication(role: UserRoleId, hasAccess: boolean): boolean {
  return role === 'customer' ? hasAccess : true;
}
