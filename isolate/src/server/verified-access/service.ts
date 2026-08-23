import { randomUUID } from 'node:crypto';
import type { UnlockTarget } from '@/domain/unlock';
import { buildActiveVerifiedAccessRecord, prepareVerifiedAccessCheckout, targetInVerifiedAccessScope, type VerifiedAccessCheckoutPreparation, type VerifiedAccessRecord, type VerifiedAccessScope } from '@/domain/verified-access';
import { buildVerifiedAccessIntelligenceSnapshot, formatVerifiedAccessRemainingTime } from '@/domain/verified-access-intelligence';
import { createNotification } from '@/server/notifications/service';
import { readVerifiedAccessStore, writeVerifiedAccessStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function withIntelligence(record: VerifiedAccessRecord): VerifiedAccessRecord {
  return { ...record, intelligence: buildVerifiedAccessIntelligenceSnapshot(record) };
}

function isActive(record: VerifiedAccessRecord): boolean {
  return record.status === 'active' && Boolean(record.expiresAt) && new Date(record.expiresAt!).getTime() > Date.now();
}

export async function prepareVerifiedAccessPurchase(customerId: string, scope: VerifiedAccessScope): Promise<VerifiedAccessCheckoutPreparation & { alreadyActive: boolean; existingAccess?: VerifiedAccessRecord }> {
  const existing = await getActiveVerifiedAccessForScope(customerId, scope);
  return { ...prepareVerifiedAccessCheckout(scope), alreadyActive: Boolean(existing), existingAccess: existing ?? undefined };
}

export async function getActiveVerifiedAccessForScope(customerId: string, scope: VerifiedAccessScope): Promise<VerifiedAccessRecord | null> {
  const data = await readVerifiedAccessStore();
  const record = data.records.find((item) => item.customerId === customerId && isActive(item) && item.scope.searchSignature === scope.searchSignature && item.scope.propertyCategory === scope.propertyCategory);
  return record ? withIntelligence(record) : null;
}

export async function hasVerifiedAccessToTarget(customerId: string, target: UnlockTarget): Promise<boolean> {
  const data = await readVerifiedAccessStore();
  return data.records.some((record) => record.customerId === customerId && isActive(record) && targetInVerifiedAccessScope(target, record.scope));
}

export async function activateVerifiedAccessAfterSuccessfulPayment(input: { customerId: string; scope: VerifiedAccessScope; paymentReference: string }): Promise<VerifiedAccessRecord> {
  const existing = await getActiveVerifiedAccessForScope(input.customerId, input.scope);
  if (existing) return existing;
  const data = await readVerifiedAccessStore();
  const record = buildActiveVerifiedAccessRecord({
    id: randomUUID(),
    customerId: input.customerId,
    scope: input.scope,
    paymentReference: input.paymentReference,
    activatedAt: nowIso()
  });
  const intelligentRecord = withIntelligence(record);
  data.records.push(intelligentRecord);
  await writeVerifiedAccessStore(data);
  await createNotification({
    recipientUserId: input.customerId,
    recipientRole: 'customer',
    audience: 'customer',
    eventType: 'verified-access-activation',
    eventKey: `verified-access-activation:${intelligentRecord.id}`,
    title: 'Verified Access is active.',
    shortDescription: 'Verified Access is now active for 72 hours.'
  });
  return intelligentRecord;
}

export async function getVerifiedAccessRemainingTime(record: VerifiedAccessRecord) {
  return formatVerifiedAccessRemainingTime(record.expiresAt);
}

export async function expireElapsedVerifiedAccessRecords(): Promise<VerifiedAccessRecord[]> {
  const data = await readVerifiedAccessStore();
  let changed = false;
  const records = data.records.map((record) => {
    if (record.status === 'active' && record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
      changed = true;
      return { ...record, status: 'expired' as const };
    }
    return record;
  });
  const withSnapshots = records.map((record) => withIntelligence(record));
  if (changed) await writeVerifiedAccessStore({ records: withSnapshots });
  return withSnapshots;
}
