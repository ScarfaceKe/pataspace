import { randomUUID } from 'node:crypto';
import type { UnlockTarget } from '@/domain/unlock';
import type { ViewingActorRole, ViewingCompletionResponse, ViewingRequestRecord, ViewingResponseAction, ViewingStatus } from '@/domain/viewing';
import { getActiveUnlockForTarget } from '@/server/unlock/service';
import { hasVerifiedAccessToTarget } from '@/server/verified-access/service';
import { getVerificationRecord } from '@/server/verification/service';
import { getVacancyConfirmationRecordsForProperty } from '@/server/vacancy-confirmation/service';
import { readEventHallStore } from '@/server/event-halls/store';
import { createNotification } from '@/server/notifications/service';
import { trackAnalyticsEvent } from '@/server/analytics/service';
import { readViewingStore, writeViewingStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

function history(input: { actorId: string; actorRole: ViewingActorRole; action: string; previousStatus?: ViewingStatus; nextStatus: ViewingStatus; note?: string; proposedDate?: string; proposedTime?: string }) {
  return { id: randomUUID(), at: nowIso(), ...input };
}

export async function resolveViewingAccess(customerId: string, target: UnlockTarget): Promise<'unlock-this-listing' | 'verified-access' | null> {
  if (await getActiveUnlockForTarget(customerId, target)) return 'unlock-this-listing';
  if (await hasVerifiedAccessToTarget(customerId, target)) return 'verified-access';
  return null;
}

export async function checkViewingPropertyEligibility(target: UnlockTarget): Promise<{ eligible: boolean; reason?: string }> {
  const verification = await getVerificationRecord(target.propertyId);
  if (verification?.status === 'verification-failed') return { eligible: false, reason: 'Property verification was unsuccessful.' };

  if (target.propertyCategory === 'event-halls') {
    const halls = await readEventHallStore();
    const hall = halls.eventHalls.find((item) => item.propertyFoundationId === target.propertyId);
    if (hall && hall.isAvailableForBookings !== 'yes') return { eligible: false, reason: 'The hall is no longer available for bookings.' };
    return { eligible: true };
  }

  const vacancyRecords = await getVacancyConfirmationRecordsForProperty(target.propertyId);
  const vacancy = vacancyRecords.find((record) => record.unitIdentifier === target.unitIdentifier);
  if (!vacancy) return { eligible: false, reason: 'This vacancy is not available for viewing.' };
  if (!vacancy.viewingRequestsAvailable || vacancy.status === 'occupied' || vacancy.status === 'waiting-for-verification') {
    return { eligible: false, reason: 'This vacancy is not currently eligible for viewing.' };
  }
  return { eligible: true };
}

export async function createViewingRequest(input: {
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  target: UnlockTarget;
  preferredDate: string;
  preferredTime: string;
  optionalMessage?: string;
  responsibleContactRole?: 'property-owner' | 'property-manager' | 'leasing-agent';
  responsibleContactId?: string;
}): Promise<{ ok: true; viewing: ViewingRequestRecord } | { ok: false; status: number; message: string }> {
  const accessSource = await resolveViewingAccess(input.customerId, input.target);
  if (!accessSource) return { ok: false, status: 403, message: 'Unlock This Listing or Verified Access is required before requesting a viewing.' };
  if (!input.preferredDate || !input.preferredTime) return { ok: false, status: 400, message: 'Choose a preferred viewing date and time.' };
  const eligibility = await checkViewingPropertyEligibility(input.target);
  if (!eligibility.eligible) return { ok: false, status: 409, message: eligibility.reason ?? 'This property is not currently eligible for viewing.' };

  const timestamp = nowIso();
  const firstHistory = history({ actorId: input.customerId, actorRole: 'customer', action: 'request-viewing', nextStatus: 'pending', note: input.optionalMessage });
  const viewing: ViewingRequestRecord = {
    id: randomUUID(),
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    target: input.target,
    propertyOrUnitIdentifier: input.target.unitIdentifier,
    propertyCategory: input.target.propertyCategory,
    accessSource,
    responsibleContactRole: input.responsibleContactRole ?? 'property-manager',
    responsibleContactId: input.responsibleContactId,
    schedule: { preferredDate: input.preferredDate, preferredTime: input.preferredTime },
    optionalMessage: input.optionalMessage,
    status: 'pending',
    requestTimestamp: timestamp,
    reminders: [
      { reminderType: '24-hours-before', sendToCustomer: true, sendToResponsibleContact: true, prepared: true },
      { reminderType: '2-hours-before', sendToCustomer: true, sendToResponsibleContact: true, prepared: true }
    ],
    history: [firstHistory],
    reviewPreparation: {
      reviewInvitationAvailableAfterCompletedViewing: false,
      eventHallReviewAfterEventDate: input.target.propertyCategory === 'event-halls'
    },
    auditTrail: [firstHistory],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const data = await readViewingStore();
  data.viewings.push(viewing);
  await writeViewingStore(data);
  await trackAnalyticsEvent({ eventType: 'viewing-requested', actorUserId: input.customerId, actorRole: 'customer', propertyId: input.target.propertyId, propertyCategory: input.target.propertyCategory });
  await createNotification({ recipientUserId: input.customerId, recipientRole: 'customer', audience: 'customer', eventType: 'viewing-request-submitted', eventKey: `viewing-submitted:${viewing.id}:customer`, title: 'Your viewing request has been sent.', shortDescription: `Viewing requested for ${input.target.unitIdentifier}.`, related: { propertyId: input.target.propertyId, unitIdentifier: input.target.unitIdentifier, propertyCategory: input.target.propertyCategory, viewingId: viewing.id } });
  if (input.responsibleContactId) await createNotification({ recipientUserId: input.responsibleContactId, recipientRole: input.responsibleContactRole ?? 'property-manager', audience: 'property-contact', eventType: 'viewing-request-submitted', eventKey: `viewing-submitted:${viewing.id}:contact`, title: 'New viewing request.', shortDescription: `A customer requested to view ${input.target.unitIdentifier}.`, related: { propertyId: input.target.propertyId, unitIdentifier: input.target.unitIdentifier, propertyCategory: input.target.propertyCategory, viewingId: viewing.id } });
  return { ok: true, viewing };
}

export async function respondToViewing(input: { viewingId: string; actorId: string; actorRole: Exclude<ViewingActorRole, 'customer'>; action: ViewingResponseAction; proposedDate?: string; proposedTime?: string; note?: string }): Promise<ViewingRequestRecord | null> {
  const data = await readViewingStore();
  const viewing = data.viewings.find((item) => item.id === input.viewingId);
  if (!viewing) return null;
  const previous = viewing.status;
  if (input.action === 'accept') viewing.status = 'accepted';
  if (input.action === 'decline') viewing.status = 'declined';
  if (input.action === 'suggest-different-time') {
    viewing.status = 'rescheduled';
    if (input.proposedDate && input.proposedTime) viewing.schedule = { preferredDate: input.proposedDate, preferredTime: input.proposedTime };
  }
  const entry = history({ actorId: input.actorId, actorRole: input.actorRole, action: input.action, previousStatus: previous, nextStatus: viewing.status, note: input.note, proposedDate: input.proposedDate, proposedTime: input.proposedTime });
  viewing.history.push(entry); viewing.auditTrail.push(entry); viewing.updatedAt = nowIso();
  await writeViewingStore(data);
  await createNotification({ recipientUserId: viewing.customerId, recipientRole: 'customer', audience: 'customer', eventType: viewing.status === 'accepted' ? 'viewing-request-accepted' : viewing.status === 'declined' ? 'viewing-request-declined' : 'viewing-request-rescheduled', eventKey: `viewing-response:${viewing.id}:${viewing.status}`, title: `Viewing ${viewing.status}.`, shortDescription: `Viewing for ${viewing.propertyOrUnitIdentifier} is now ${viewing.status}.`, related: { propertyId: viewing.target.propertyId, unitIdentifier: viewing.propertyOrUnitIdentifier, propertyCategory: viewing.propertyCategory, viewingId: viewing.id } });
  return viewing;
}

export async function cancelViewing(input: { viewingId: string; actorId: string; actorRole: ViewingActorRole; reason?: string }): Promise<ViewingRequestRecord | null> {
  const data = await readViewingStore();
  const viewing = data.viewings.find((item) => item.id === input.viewingId);
  if (!viewing) return null;
  const previous = viewing.status;
  viewing.status = 'cancelled';
  const entry = history({ actorId: input.actorId, actorRole: input.actorRole, action: 'cancel-viewing', previousStatus: previous, nextStatus: 'cancelled', note: input.reason });
  viewing.history.push(entry); viewing.auditTrail.push(entry); viewing.updatedAt = nowIso();
  await writeViewingStore(data);
  const notifyUserId = input.actorRole === 'customer' ? viewing.responsibleContactId : viewing.customerId;
  if (notifyUserId) await createNotification({ recipientUserId: notifyUserId, recipientRole: input.actorRole === 'customer' ? viewing.responsibleContactRole : 'customer', audience: input.actorRole === 'customer' ? 'property-contact' : 'customer', eventType: 'viewing-cancellation', eventKey: `viewing-cancelled:${viewing.id}:${notifyUserId}`, title: 'Viewing cancelled.', shortDescription: `Viewing for ${viewing.propertyOrUnitIdentifier} was cancelled.`, related: { propertyId: viewing.target.propertyId, unitIdentifier: viewing.propertyOrUnitIdentifier, propertyCategory: viewing.propertyCategory, viewingId: viewing.id } });
  return viewing;
}

export async function completeViewing(input: { viewingId: string; actorId: string; actorRole: ViewingActorRole; response: ViewingCompletionResponse; note?: string }): Promise<ViewingRequestRecord | null> {
  const data = await readViewingStore();
  const viewing = data.viewings.find((item) => item.id === input.viewingId);
  if (!viewing) return null;
  const previous = viewing.status;
  if (input.actorRole === 'customer') viewing.customerCompletionResponse = input.response;
  else viewing.responsibleContactCompletionResponse = input.response;
  viewing.status = 'completed';
  viewing.reviewPreparation.reviewInvitationAvailableAfterCompletedViewing = viewing.propertyCategory !== 'event-halls';
  viewing.reviewPreparation.eventHallReviewAfterEventDate = viewing.propertyCategory === 'event-halls';
  const entry = history({ actorId: input.actorId, actorRole: input.actorRole, action: 'complete-viewing', previousStatus: previous, nextStatus: 'completed', note: input.note });
  viewing.history.push(entry); viewing.auditTrail.push(entry); viewing.updatedAt = nowIso();
  await writeViewingStore(data);
  await createNotification({ recipientUserId: viewing.customerId, recipientRole: 'customer', audience: 'customer', eventType: 'viewing-completed', eventKey: `viewing-completed:${viewing.id}:customer`, title: 'Viewing completed.', shortDescription: `Viewing for ${viewing.propertyOrUnitIdentifier} has been marked as completed.`, related: { propertyId: viewing.target.propertyId, unitIdentifier: viewing.propertyOrUnitIdentifier, propertyCategory: viewing.propertyCategory, viewingId: viewing.id } });
  return viewing;
}

export async function getViewingHistoryForCustomer(customerId: string): Promise<ViewingRequestRecord[]> {
  const data = await readViewingStore();
  return data.viewings.filter((viewing) => viewing.customerId === customerId);
}

export async function getViewingHistoryForResponsibleContact(actorId: string): Promise<ViewingRequestRecord[]> {
  const data = await readViewingStore();
  return data.viewings.filter((viewing) => viewing.responsibleContactId === actorId);
}
