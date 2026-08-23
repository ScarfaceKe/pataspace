import type { PropertyCategoryId, UserRoleId } from './types';

export type VerificationStatus = 'pending-verification' | 'verified' | 'waiting-for-verification' | 'verification-failed';
export type VerificationQueuePriority = 'normal' | 'attention-needed' | 'high';
export type VerificationNotificationType =
  | 'awaiting-verification'
  | 'property-verified'
  | 'verification-requires-attention'
  | 'verification-unsuccessful'
  | 'returned-to-waiting-for-verification';

export interface VerificationPreCheckResult {
  id: string;
  label: string;
  passed: boolean;
  correctionHint?: string;
}

export interface VerificationNotificationPreparation {
  type: VerificationNotificationType;
  title: string;
  message: string;
  spamSafe: true;
}

export interface PropertyVerificationRecord {
  id: string;
  propertyId: string;
  propertyCategory: PropertyCategoryId;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  status: VerificationStatus;
  publicBadgeEligible: boolean;
  officialBadgeLabel?: 'PataSpace Verified';
  queuePriority: VerificationQueuePriority;
  duplicateCandidateIds: string[];
  preChecks: VerificationPreCheckResult[];
  correctionRequired: boolean;
  correctionHints: string[];
  automatedRetryCount: number;
  aiAdminAssistant: VerificationAiAdminAssistantPreparation;
  platformHealthMonitor: VerificationHealthMonitorPreparation;
  notificationsPrepared: VerificationNotificationPreparation[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  failedAt?: string;
  returnedToWaitingAt?: string;
}

export interface VerificationAiAdminAssistantPreparation {
  prepared: true;
  prioritiseVerificationQueues: true;
  detectDuplicateRegistrations: true;
  flagUnusualVerificationPatterns: true;
  recommendPropertiesRequiringAttention: true;
  makesFinalVerificationDecision: false;
  platformAdministratorRemainsInControl: true;
}

export interface VerificationHealthMonitorPreparation {
  prepared: true;
  monitorWaitingForVerification: true;
  monitorCompletionRates: true;
  monitorFrequentlyFailingAttempts: true;
  monitorAreasWithManyUnverifiedProperties: true;
  recommendationsOnly: true;
  automaticallyChangesVerificationDecisions: false;
}

export const VERIFICATION_FOUNDATION = {
  supportedCategories: ['houses', 'shops', 'offices', 'event-halls'] as const,
  statuses: ['pending-verification', 'verified', 'waiting-for-verification', 'verification-failed'] as const,
  officialVerifiedBadge: 'PataSpace Verified',
  registrationAndVerificationAreSeparate: true,
  dailyVacancyConfirmationRemainsSeparate: true,
  philosophy: [
    'Increase trust',
    'Improve search quality',
    'Reduce fake listings',
    'Improve customer confidence',
    'Support the AI Admin Assistant',
    'Support the Platform Health Monitor',
    'Never feel like punishment'
  ] as const,
  successPhilosophy: {
    target: 'Extremely high first-time verification success rate for genuine property listings',
    failOnlyAfterExhaustingCorrection: true,
    appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const
  },
  futureIntegrations: [
    'Registration Modules',
    'Daily Vacancy Confirmation',
    'Search Priority',
    'Unlock This Listing',
    'Verified Access',
    'Viewing Workflow',
    'Reviews',
    'Notifications',
    'AI Admin Assistant',
    'Platform Health Monitor'
  ] as const
} as const;

export const VERIFICATION_NOTIFICATIONS: readonly VerificationNotificationPreparation[] = [
  {
    type: 'awaiting-verification',
    title: 'Your property is awaiting verification.',
    message: 'Your property has been registered and is now waiting for PataSpace verification.',
    spamSafe: true
  },
  {
    type: 'property-verified',
    title: 'Your property has been verified.',
    message: 'Your property has successfully completed PataSpace verification.',
    spamSafe: true
  },
  {
    type: 'verification-requires-attention',
    title: 'Your verification requires attention.',
    message: 'Please review the highlighted property details so verification can continue.',
    spamSafe: true
  },
  {
    type: 'verification-unsuccessful',
    title: 'Your property verification was unsuccessful.',
    message: 'Verification could not be completed. Please correct the required information before requesting verification again.',
    spamSafe: true
  },
  {
    type: 'returned-to-waiting-for-verification',
    title: 'Your property has returned to Waiting for Verification.',
    message: 'Your corrected property details have been received and verification will continue.',
    spamSafe: true
  }
] as const;

export function isPublicVerifiedBadgeVisible(status: VerificationStatus): boolean {
  return status === 'verified';
}
