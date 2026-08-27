import { randomUUID } from 'node:crypto';
import { buildVacancyIntelligenceSnapshot } from '@/domain/vacancy-confirmation-intelligence';
import type { VacancyConfirmationPropertyCategory, VacancyConfirmationRecord } from '@/domain/vacancy-confirmation';
import { readVacancyConfirmationStore, writeVacancyConfirmationStore } from './store';

const HOUR_MS = 60 * 60 * 1000;
const ACTIVE_WINDOW_MS = 24 * HOUR_MS;
const GRACE_WINDOW_MS = 24 * HOUR_MS;
const REMINDER_BEFORE_EXPIRY_MS = 2 * HOUR_MS;

function nowIso(): string {
  return new Date().toISOString();
}

function addMsIso(baseIso: string, ms: number): string {
  return new Date(new Date(baseIso).getTime() + ms).toISOString();
}

function buildRecord(input: {
  propertyId: string;
  sourceRegistrationId: string;
  category: VacancyConfirmationPropertyCategory;
  unitIdentifier: string;
  confirmedAt?: string;
}): VacancyConfirmationRecord {
  const confirmedAt = input.confirmedAt ?? nowIso();
  return {
    id: randomUUID(),
    propertyId: input.propertyId,
    sourceRegistrationId: input.sourceRegistrationId,
    category: input.category,
    unitIdentifier: input.unitIdentifier,
    status: 'confirmed-vacancy',
    lastConfirmedAt: confirmedAt,
    activeUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS),
    graceUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS + GRACE_WINDOW_MS),
    reminderDueAt: addMsIso(confirmedAt, ACTIVE_WINDOW_MS - REMINDER_BEFORE_EXPIRY_MS),
    reminderPrepared: true,
    visibleInCustomerSearch: true,
    unlockThisListingAvailable: true,
    verifiedAccessAvailable: true,
    viewingRequestsAvailable: true,
    confirmationHistory: [{ action: 'confirm-still-vacant', at: confirmedAt, note: 'Initial vacancy confirmation recorded automatically when the vacant unit was published.' }],
    intelligence: buildVacancyIntelligenceSnapshot({
      id: 'pending',
      propertyId: input.propertyId,
      sourceRegistrationId: input.sourceRegistrationId,
      category: input.category,
      unitIdentifier: input.unitIdentifier,
      status: 'confirmed-vacancy',
      lastConfirmedAt: confirmedAt,
      activeUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS),
      graceUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS + GRACE_WINDOW_MS),
      reminderDueAt: addMsIso(confirmedAt, ACTIVE_WINDOW_MS - REMINDER_BEFORE_EXPIRY_MS),
      reminderPrepared: true,
      visibleInCustomerSearch: true,
      unlockThisListingAvailable: true,
      verifiedAccessAvailable: true,
      viewingRequestsAvailable: true,
      confirmationHistory: [],
      intelligence: undefined as never,
      createdAt: confirmedAt,
      updatedAt: confirmedAt
    }),
    createdAt: confirmedAt,
    updatedAt: confirmedAt
  };
}

function withIntelligence(record: VacancyConfirmationRecord, at: Date = new Date()): VacancyConfirmationRecord {
  return { ...record, intelligence: buildVacancyIntelligenceSnapshot(record, at) };
}

export function deriveVacancyConfirmationStatus(record: VacancyConfirmationRecord, at: Date = new Date()): VacancyConfirmationRecord {
  if (record.status === 'occupied') return withIntelligence(record, at);
  const current = at.getTime();
  const activeUntil = new Date(record.activeUntil).getTime();
  const graceUntil = new Date(record.graceUntil).getTime();
  if (current <= activeUntil) {
    return withIntelligence({ ...record, status: 'confirmed-vacancy', visibleInCustomerSearch: true, unlockThisListingAvailable: true, verifiedAccessAvailable: true, viewingRequestsAvailable: true }, at);
  }
  if (current <= graceUntil) {
    return withIntelligence({ ...record, status: 'grace-period', visibleInCustomerSearch: true, unlockThisListingAvailable: true, verifiedAccessAvailable: true, viewingRequestsAvailable: true }, at);
  }
  // After grace period: transition to unverified-vacancy (still visible but with warning)
  // Only hide completely after 1 week (the one-week removal rule from vacancy confirmation intelligence)
  const unverifiedSince = record.waitingForVerificationAt ?? new Date(graceUntil).toISOString();
  const unverifiedMs = current - new Date(unverifiedSince).getTime();
  const ONE_WEEK_MS = 7 * 24 * HOUR_MS;

  if (unverifiedMs <= ONE_WEEK_MS) {
    // Still within the unverified window: visible in search but with warning, 20% unlock discount
    return withIntelligence({
      ...record,
      status: 'unverified-vacancy',
      visibleInCustomerSearch: true,
      unlockThisListingAvailable: true,
      verifiedAccessAvailable: false,
      viewingRequestsAvailable: false,
      waitingForVerificationAt: unverifiedSince
    }, at);
  }

  // After 1 week unconfirmed: fully hidden (one-week removal rule)
  return withIntelligence({
    ...record,
    status: 'waiting-for-verification',
    visibleInCustomerSearch: false,
    unlockThisListingAvailable: false,
    verifiedAccessAvailable: false,
    viewingRequestsAvailable: false,
    waitingForVerificationAt: unverifiedSince
  }, at);
}

export async function createVacancyConfirmationRecords(input: {
  propertyId: string;
  sourceRegistrationId: string;
  category: VacancyConfirmationPropertyCategory;
  unitIdentifiers: string[];
  confirmedAt?: string;
}): Promise<VacancyConfirmationRecord[]> {
  const identifiers = input.unitIdentifiers.map((item) => item.trim()).filter(Boolean);
  if (!identifiers.length) return [];
  const data = await readVacancyConfirmationStore();
  const created: VacancyConfirmationRecord[] = [];
  for (const unitIdentifier of identifiers) {
    const existing = data.records.find(
      (record) => record.propertyId === input.propertyId && record.sourceRegistrationId === input.sourceRegistrationId && record.unitIdentifier === unitIdentifier
    );
    if (existing) {
      created.push(existing);
      continue;
    }
    const record = buildRecord({ ...input, unitIdentifier });
    data.records.push(record);
    created.push(record);
  }
  await writeVacancyConfirmationStore(data);
  return created;
}

export async function confirmVacancy(recordId: string): Promise<VacancyConfirmationRecord | null> {
  const data = await readVacancyConfirmationStore();
  const index = data.records.findIndex((record) => record.id === recordId);
  if (index === -1) return null;
  const confirmedAt = nowIso();
  const existing = data.records[index];
  const updated: VacancyConfirmationRecord = {
    ...existing,
    status: 'confirmed-vacancy',
    lastConfirmedAt: confirmedAt,
    activeUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS),
    graceUntil: addMsIso(confirmedAt, ACTIVE_WINDOW_MS + GRACE_WINDOW_MS),
    reminderDueAt: addMsIso(confirmedAt, ACTIVE_WINDOW_MS - REMINDER_BEFORE_EXPIRY_MS),
    visibleInCustomerSearch: true,
    unlockThisListingAvailable: true,
    verifiedAccessAvailable: true,
    viewingRequestsAvailable: true,
    updatedAt: confirmedAt,
    waitingForVerificationAt: undefined,
    confirmationHistory: [...existing.confirmationHistory, { action: existing.status === 'waiting-for-verification' ? 'reconfirm-after-waiting' : 'confirm-still-vacant', at: confirmedAt, note: 'Registrant confirmed that this specific unit is still vacant.' }]
  };
  data.records[index] = withIntelligence(updated);
  await writeVacancyConfirmationStore(data);
  return data.records[index];
}

export async function closeVacancy(recordId: string): Promise<VacancyConfirmationRecord | null> {
  const data = await readVacancyConfirmationStore();
  const index = data.records.findIndex((record) => record.id === recordId);
  if (index === -1) return null;
  const closedAt = nowIso();
  const existing = data.records[index];
  const updated: VacancyConfirmationRecord = {
    ...existing,
    status: 'occupied',
    visibleInCustomerSearch: false,
    unlockThisListingAvailable: false,
    verifiedAccessAvailable: false,
    viewingRequestsAvailable: false,
    occupiedAt: closedAt,
    updatedAt: closedAt,
    confirmationHistory: [...existing.confirmationHistory, { action: 'mark-occupied', at: closedAt, note: 'Registrant marked this unit as no longer vacant.' }]
  };
  data.records[index] = withIntelligence(updated);
  await writeVacancyConfirmationStore(data);
  return data.records[index];
}

export async function getVacancyConfirmationRecordsForProperty(propertyId: string): Promise<VacancyConfirmationRecord[]> {
  const data = await readVacancyConfirmationStore();
  const changed = data.records.map((record) => (record.propertyId === propertyId ? deriveVacancyConfirmationStatus(record) : record));
  const didChange = JSON.stringify(changed) !== JSON.stringify(data.records);
  if (didChange) await writeVacancyConfirmationStore({ records: changed });
  return changed.filter((record) => record.propertyId === propertyId);
}

export async function getAllVacancyConfirmationRecords(): Promise<VacancyConfirmationRecord[]> {
  const data = await readVacancyConfirmationStore();
  const updated = data.records.map((record) => deriveVacancyConfirmationStatus(record));
  if (JSON.stringify(updated) !== JSON.stringify(data.records)) await writeVacancyConfirmationStore({ records: updated });
  return updated;
}

/**
 * Check if a property has any unverified vacancy units.
 * Used by the unlock pricing system to apply the 20% discount.
 */
export async function hasUnverifiedVacancyForProperty(propertyId: string): Promise<boolean> {
  const records = await getVacancyConfirmationRecordsForProperty(propertyId);
  return records.some((r) => r.status === 'unverified-vacancy');
}

/**
 * Get unverified vacancy records for a property.
 * Used by match engine to show warning labels on unverified listings.
 */
export async function getUnverifiedVacancyRecords(propertyId: string): Promise<VacancyConfirmationRecord[]> {
  const records = await getVacancyConfirmationRecordsForProperty(propertyId);
  return records.filter((r) => r.status === 'unverified-vacancy');
}

/**
 * Calculate the discounted unlock price for an unverified vacancy listing.
 * Applies 20% discount off the standard Unlock This Listing price.
 */
export function calculateUnverifiedVacancyDiscount(standardPrice: number): {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  discountLabel: string;
} {
  const discountPercentage = 20;
  const discountAmount = Math.round(standardPrice * (discountPercentage / 100));
  const discountedPrice = standardPrice - discountAmount;
  return {
    originalPrice: standardPrice,
    discountedPrice,
    discountPercentage,
    discountLabel: `${discountPercentage}% off — Vacancy not yet confirmed by property manager`
  };
}

/**
 * Get the number of days a listing has been unverified.
 * Returns 0 if the listing is not in unverified-vacancy status.
 * Used by match engine to display "Not verified for X days" on the listing card.
 */
export function getDaysUnverified(record: VacancyConfirmationRecord): number {
  if (record.status !== 'unverified-vacancy' || !record.waitingForVerificationAt) return 0;
  const unverifiedSince = new Date(record.waitingForVerificationAt).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - unverifiedSince) / (24 * 60 * 60 * 1000));
  return Math.max(1, daysSince);
}

/**
 * Get the unverified label for display on property cards.
 * Returns null if the listing is not unverified.
 */
export function getUnverifiedLabel(record: VacancyConfirmationRecord): string | null {
  if (record.status !== 'unverified-vacancy') return null;
  const days = getDaysUnverified(record);
  if (days === 1) return 'Vacancy not confirmed — may or may not be available';
  return `Vacancy not confirmed for ${days} days — may or may not be available`;
}

/**
 * Check if a property has any verified (confirmed-vacancy or grace-period) units.
 * Used by the match engine to ensure verified listings always rank above unverified.
 */
export async function hasVerifiedVacancyForProperty(propertyId: string): Promise<boolean> {
  const records = await getVacancyConfirmationRecordsForProperty(propertyId);
  return records.some((r) => r.status === 'confirmed-vacancy' || r.status === 'grace-period');
}

/**
 * Get the vacancy ranking tier for a property.
 * Used by the match engine to sort verified above unverified in search results.
 * 
 * Ranking tiers (highest to lowest):
 * 1. confirmed-vacancy (recently confirmed)
 * 2. grace-period (within 24h grace)
 * 3. unverified-vacancy (3+ days unconfirmed, but still visible)
 * 4. waiting-for-verification (hidden after 7 days)
 */
export function getVacancyRankingTier(record: VacancyConfirmationRecord): number {
  switch (record.status) {
    case 'confirmed-vacancy': return 1;
    case 'grace-period': return 2;
    case 'unverified-vacancy': return 3;
    case 'waiting-for-verification': return 4;
    case 'occupied': return 5;
    default: return 5;
  }
}

/**
 * Compare two vacancy records for ranking purposes.
 * Returns negative if a should rank higher, positive if b should rank higher.
 * Verified listings ALWAYS rank above unverified listings.
 */
export function compareVacancyRanking(a: VacancyConfirmationRecord, b: VacancyConfirmationRecord): number {
  const tierA = getVacancyRankingTier(a);
  const tierB = getVacancyRankingTier(b);
  if (tierA !== tierB) return tierA - tierB;
  // Same tier: more recently confirmed ranks higher
  return new Date(b.lastConfirmedAt).getTime() - new Date(a.lastConfirmedAt).getTime();
}
