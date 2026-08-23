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
  return withIntelligence({
    ...record,
    status: 'waiting-for-verification',
    visibleInCustomerSearch: false,
    unlockThisListingAvailable: false,
    verifiedAccessAvailable: false,
    viewingRequestsAvailable: false,
    waitingForVerificationAt: record.waitingForVerificationAt ?? new Date(graceUntil).toISOString()
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
