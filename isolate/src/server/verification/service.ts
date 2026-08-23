import { randomUUID } from 'node:crypto';
import type { RegisteredPropertyFoundation } from '@/domain/property-registration';
import {
  VERIFICATION_NOTIFICATIONS,
  isPublicVerifiedBadgeVisible,
  type PropertyVerificationRecord,
  type VerificationPreCheckResult,
  type VerificationStatus
} from '@/domain/verification';
import { createNotification } from '@/server/notifications/service';
import { readVerificationStore, writeVerificationStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function buildPreChecks(property: RegisteredPropertyFoundation): VerificationPreCheckResult[] {
  const checks: VerificationPreCheckResult[] = [
    {
      id: 'required-registration-information',
      label: 'Required registration information is present',
      passed: Boolean(property.description && property.location.county && property.location.townOrCity && property.location.estateOrAreaOrNeighbourhood),
      correctionHint: 'Complete the required property description and location details.'
    },
    {
      id: 'logical-consistency',
      label: 'Property information is logically consistent',
      passed: !property.reviewFlags.includes('logical-consistency-review'),
      correctionHint: 'Review vacancy and property details for consistency.'
    },
    {
      id: 'duplicate-registration-check',
      label: 'No obvious duplicate registration was detected',
      passed: property.duplicateCandidateIds.length === 0,
      correctionHint: 'Check whether this property has already been registered.'
    },
    {
      id: 'unit-identification-check',
      label: 'Vacant units use real-world identifiers where applicable',
      passed: property.hasVacantUnits === 'no' || Boolean(property.vacancy?.unitIdentifiers?.length),
      correctionHint: 'Add the real-world identifier for every vacant unit exactly as it appears on the property.'
    }
  ];

  if (property.category !== 'event-halls') {
    checks.push({
      id: 'electricity-information-check',
      label: 'Electricity information is present where required',
      passed: Boolean(property.electricity?.isElectricityAvailable),
      correctionHint: 'Add electricity availability and billing information.'
    });
  }

  return checks.map((check) => (check.passed ? { ...check, correctionHint: undefined } : check));
}

function buildRecord(property: RegisteredPropertyFoundation): PropertyVerificationRecord {
  const preChecks = buildPreChecks(property);
  const correctionHints = preChecks.filter((check) => !check.passed).map((check) => check.correctionHint).filter(Boolean) as string[];
  const correctionRequired = correctionHints.length > 0;
  const status: VerificationStatus = correctionRequired ? 'pending-verification' : 'waiting-for-verification';

  return {
    id: randomUUID(),
    propertyId: property.id,
    propertyCategory: property.category,
    registeredByUserId: property.registeredByUserId,
    registeredByRole: property.registeredByRole,
    status,
    publicBadgeEligible: isPublicVerifiedBadgeVisible(status),
    officialBadgeLabel: undefined,
    queuePriority: correctionRequired || property.reviewFlags.length ? 'attention-needed' : 'normal',
    duplicateCandidateIds: property.duplicateCandidateIds,
    preChecks,
    correctionRequired,
    correctionHints,
    automatedRetryCount: correctionRequired ? 1 : 0,
    aiAdminAssistant: {
      prepared: true,
      prioritiseVerificationQueues: true,
      detectDuplicateRegistrations: true,
      flagUnusualVerificationPatterns: true,
      recommendPropertiesRequiringAttention: true,
      makesFinalVerificationDecision: false,
      platformAdministratorRemainsInControl: true
    },
    platformHealthMonitor: {
      prepared: true,
      monitorWaitingForVerification: true,
      monitorCompletionRates: true,
      monitorFrequentlyFailingAttempts: true,
      monitorAreasWithManyUnverifiedProperties: true,
      recommendationsOnly: true,
      automaticallyChangesVerificationDecisions: false
    },
    notificationsPrepared: [...VERIFICATION_NOTIFICATIONS],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export async function createVerificationWorkflow(property: RegisteredPropertyFoundation): Promise<PropertyVerificationRecord> {
  const data = await readVerificationStore();
  const existing = data.records.find((record) => record.propertyId === property.id);
  if (existing) return existing;
  const record = buildRecord(property);
  data.records.push(record);
  await writeVerificationStore(data);
  return record;
}

export async function updateVerificationStatus(
  propertyId: string,
  status: VerificationStatus,
  options?: { correctionHints?: string[] }
): Promise<PropertyVerificationRecord | null> {
  const data = await readVerificationStore();
  const record = data.records.find((item) => item.propertyId === propertyId);
  if (!record) return null;
  record.status = status;
  record.publicBadgeEligible = isPublicVerifiedBadgeVisible(status);
  record.officialBadgeLabel = status === 'verified' ? 'PataSpace Verified' : undefined;
  record.correctionRequired = status === 'verification-failed' || status === 'pending-verification';
  record.correctionHints = options?.correctionHints ?? record.correctionHints;
  record.updatedAt = nowIso();
  if (status === 'verified') record.verifiedAt = record.updatedAt;
  if (status === 'verification-failed') record.failedAt = record.updatedAt;
  if (status === 'waiting-for-verification') record.returnedToWaitingAt = record.updatedAt;
  await writeVerificationStore(data);
  await createNotification({ recipientUserId: record.registeredByUserId, recipientRole: record.registeredByRole, audience: 'property-contact', eventType: 'property-verification-update', eventKey: `verification-status:${record.propertyId}:${status}:${record.updatedAt}`, title: status === 'verified' ? 'Your property has been verified.' : status === 'verification-failed' ? 'Your property verification was unsuccessful.' : 'Your property verification status changed.', shortDescription: `Verification status is now ${status}.`, related: { propertyId: record.propertyId, propertyCategory: record.propertyCategory } });
  return record;
}

export async function requestVerificationAgain(propertyId: string): Promise<PropertyVerificationRecord | null> {
  return updateVerificationStatus(propertyId, 'waiting-for-verification', { correctionHints: [] });
}

export async function getVerificationRecord(propertyId: string): Promise<PropertyVerificationRecord | null> {
  const data = await readVerificationStore();
  return data.records.find((record) => record.propertyId === propertyId) ?? null;
}

export async function getVerificationQueue(): Promise<PropertyVerificationRecord[]> {
  const data = await readVerificationStore();
  return data.records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
