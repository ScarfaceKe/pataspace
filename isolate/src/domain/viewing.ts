import type { UnlockTarget } from './unlock';
import type { PropertyCategoryId, UserRoleId } from './types';

export type ViewingStatus = 'pending' | 'accepted' | 'rescheduled' | 'declined' | 'cancelled' | 'completed';
export type ViewingActorRole = 'customer' | 'property-owner' | 'property-manager' | 'leasing-agent' | 'platform-admin';
export type ViewingResponseAction = 'accept' | 'suggest-different-time' | 'decline';
export type ViewingCompletionResponse = 'viewing-took-place' | 'viewing-did-not-happen';
export type ViewingAccessSource = 'unlock-this-listing' | 'verified-access';

export interface ViewingSchedule {
  preferredDate: string;
  preferredTime: string;
}

export interface ViewingHistoryEntry {
  id: string;
  at: string;
  actorId: string;
  actorRole: ViewingActorRole;
  action: string;
  previousStatus?: ViewingStatus;
  nextStatus: ViewingStatus;
  note?: string;
  proposedDate?: string;
  proposedTime?: string;
}

export interface ViewingReminderPreparation {
  reminderType: '24-hours-before' | '2-hours-before';
  sendToCustomer: true;
  sendToResponsibleContact: true;
  prepared: true;
}

export interface ViewingRequestRecord {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  target: UnlockTarget;
  propertyOrUnitIdentifier: string;
  propertyCategory: PropertyCategoryId;
  accessSource: ViewingAccessSource;
  responsibleContactRole: Exclude<ViewingActorRole, 'customer' | 'platform-admin'>;
  responsibleContactId?: string;
  schedule: ViewingSchedule;
  optionalMessage?: string;
  status: ViewingStatus;
  requestTimestamp: string;
  reminders: ViewingReminderPreparation[];
  history: ViewingHistoryEntry[];
  customerCompletionResponse?: ViewingCompletionResponse;
  responsibleContactCompletionResponse?: ViewingCompletionResponse;
  reviewPreparation: {
    reviewInvitationAvailableAfterCompletedViewing: boolean;
    eventHallReviewAfterEventDate: boolean;
  };
  auditTrail: ViewingHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export const VIEWING_WORKFLOW_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  requiresActiveEntitlement: true,
  eligibleAccessSources: ['Unlock This Listing', 'Verified Access'] as const,
  customersWithoutAccessCanSubmitViewingRequests: false,
  guidedRequestControls: ['Toggle buttons', 'Date picker', 'Time selector', 'Optional note field'] as const,
  statuses: ['pending', 'accepted', 'rescheduled', 'declined', 'cancelled', 'completed'] as const,
  reminders: ['24 hours before viewing', '2 hours before viewing'] as const,
  security: {
    customersManageOnlyOwnRequests: true,
    registrantsManageOnlyRelatedPropertyRequests: true,
    completeAuditTrailRequired: true
  },
  integration: [
    'Property Registration',
    'Property Verification',
    'House Match',
    'Shop Match',
    'Office Match',
    'Event Hall Match',
    'Unlock This Listing',
    'Verified Access',
    'Customer Access Control Standard',
    'Notifications',
    'Reviews',
    'Customer Accounts'
  ] as const
} as const;

export const VIEWING_NOTIFICATIONS = {
  submitted: 'Your viewing request has been sent.',
  accepted: 'Your viewing request has been accepted.',
  rescheduled: 'A different viewing time has been suggested.',
  declined: 'Your viewing request was declined.',
  cancelled: 'The viewing request was cancelled.',
  completed: 'The viewing has been marked as completed.',
  propertyUnavailable: 'The property status changed before your viewing. Please review the latest availability.'
} as const;
