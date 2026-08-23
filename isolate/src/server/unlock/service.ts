import { randomUUID } from 'node:crypto';
import { applyUnlockAccessState, buildActiveUnlockRecord, getUnlockPriceForTarget, isUnlockAccessActive, prepareUnlockCheckout, type UnlockAccessRecord, type UnlockCheckoutPreparation, type UnlockTarget } from '@/domain/unlock';
import { createNotification } from '@/server/notifications/service';
import { readUnlockStore, writeUnlockStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function sameTarget(a: UnlockTarget, b: UnlockTarget): boolean {
  return a.propertyId === b.propertyId && a.unitIdentifier === b.unitIdentifier && a.propertyCategory === b.propertyCategory;
}

export async function prepareUnlockThisListing(customerId: string, target: UnlockTarget): Promise<UnlockCheckoutPreparation & { alreadyUnlocked: boolean; existingUnlock?: UnlockAccessRecord }> {
  const existing = await getActiveUnlockForTarget(customerId, target);
  return { ...prepareUnlockCheckout(target), alreadyUnlocked: Boolean(existing), existingUnlock: existing ?? undefined };
}

export async function getActiveUnlockForTarget(customerId: string, target: UnlockTarget): Promise<UnlockAccessRecord | null> {
  const data = await readUnlockStore();
  const record = data.unlocks.find((item) => item.customerId === customerId && item.status !== 'pending-payment' && sameTarget(item.target, target));
  if (!record) return null;
  const withState = applyUnlockAccessState(record);
  return isUnlockAccessActive(withState) ? withState : null;
}

export async function hasPurchasedAccess(customerId: string, target: UnlockTarget): Promise<boolean> {
  return Boolean(await getActiveUnlockForTarget(customerId, target));
}

export async function grantUnlockAfterSuccessfulPayment(input: { customerId: string; target: UnlockTarget; paymentReference: string }): Promise<UnlockAccessRecord> {
  const data = await readUnlockStore();
  const existing = data.unlocks.find((record) => record.customerId === input.customerId && sameTarget(record.target, input.target) && isUnlockAccessActive(record));
  if (existing) return applyUnlockAccessState(existing);
  const record = buildActiveUnlockRecord({
    id: randomUUID(),
    customerId: input.customerId,
    target: input.target,
    paymentReference: input.paymentReference,
    unlockedAt: nowIso()
  });
  const withState = applyUnlockAccessState(record);
  data.unlocks.push(withState);
  await writeUnlockStore(data);
  await createNotification({
    recipientUserId: input.customerId,
    recipientRole: 'customer',
    audience: 'customer',
    eventType: 'property-unlock-confirmation',
    eventKey: `unlock-confirmation:${withState.id}`,
    title: 'Property unlocked.',
    shortDescription: `You have unlocked ${input.target.unitIdentifier}.`,
    related: { propertyId: input.target.propertyId, unitIdentifier: input.target.unitIdentifier, propertyCategory: input.target.propertyCategory }
  });
  return withState;
}

export async function markUnlockedPropertyUnavailable(customerId: string, target: UnlockTarget): Promise<UnlockAccessRecord | null> {
  const data = await readUnlockStore();
  const record = data.unlocks.find((item) => item.customerId === customerId && sameTarget(item.target, target) && item.status === 'active');
  if (!record) return null;
  record.status = 'unavailable-after-purchase';
  record.propertyBecameUnavailableAt = nowIso();
  const withState = applyUnlockAccessState(record);
  await writeUnlockStore(data);
  return withState;
}

export { getUnlockPriceForTarget };

export async function expireElapsedUnlockAccessRecords(): Promise<UnlockAccessRecord[]> {
  const data = await readUnlockStore();
  let changed = false;
  const unlocks = data.unlocks.map((record) => {
    const withState = applyUnlockAccessState(record);
    if (withState.status !== record.status || withState.displayStatus !== record.displayStatus) changed = true;
    return withState;
  });
  if (changed) await writeUnlockStore({ unlocks });
  return unlocks;
}
