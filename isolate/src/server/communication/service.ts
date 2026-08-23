import { buildIntelligentNotificationSummary, prepareWhatsAppMessage, type CustomerNotificationPreferences } from '@/domain/communication';
import { readCommunicationStore, writeCommunicationStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

function defaultPreferences(customerId: string): CustomerNotificationPreferences {
  return {
    customerId,
    newMatchingProperties: true,
    viewingReminders: true,
    inAppNotifications: true,
    whatsappNotifications: true,
    emailNotifications: false,
    deliveryChannelsSelectableByCustomer: true,
    emailDeliveryPreparedForFutureApprovalOnly: true,
    updatedAt: nowIso()
  };
}

export async function getCustomerNotificationPreferences(customerId: string): Promise<CustomerNotificationPreferences> {
  const store = await readCommunicationStore();
  const existing = store.customerPreferences.find((item) => item.customerId === customerId) as Partial<CustomerNotificationPreferences> | undefined;
  return existing ? { ...defaultPreferences(customerId), ...existing, deliveryChannelsSelectableByCustomer: true, emailDeliveryPreparedForFutureApprovalOnly: true } : defaultPreferences(customerId);
}

export async function updateCustomerNotificationPreferences(input: {
  customerId: string;
  newMatchingProperties?: boolean;
  viewingReminders?: boolean;
  inAppNotifications?: boolean;
  whatsappNotifications?: boolean;
  emailNotifications?: boolean;
}): Promise<CustomerNotificationPreferences> {
  const store = await readCommunicationStore();
  const current = await getCustomerNotificationPreferences(input.customerId);
  const record: CustomerNotificationPreferences = {
    ...current,
    newMatchingProperties: input.newMatchingProperties ?? current.newMatchingProperties,
    viewingReminders: input.viewingReminders ?? current.viewingReminders,
    inAppNotifications: input.inAppNotifications ?? current.inAppNotifications,
    whatsappNotifications: input.whatsappNotifications ?? current.whatsappNotifications,
    // Email delivery remains disabled by default and prepared only for future Founder approval.
    emailNotifications: input.emailNotifications ?? current.emailNotifications,
    deliveryChannelsSelectableByCustomer: true,
    emailDeliveryPreparedForFutureApprovalOnly: true,
    updatedAt: nowIso()
  };
  const index = store.customerPreferences.findIndex((item) => item.customerId === input.customerId);
  if (index >= 0) store.customerPreferences[index] = record;
  else store.customerPreferences.push(record);
  await writeCommunicationStore(store);
  return record;
}

export function preparePropertyWhatsAppMessage(input: Parameters<typeof prepareWhatsAppMessage>[0]) { return prepareWhatsAppMessage(input); }
export function prepareNotificationSummary(messages: string[]) { return buildIntelligentNotificationSummary(messages); }
