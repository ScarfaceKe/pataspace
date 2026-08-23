import type { VacancyConfirmationRecord } from './vacancy-confirmation';

export type VacancyFreshnessStatus =
  | 'recently-confirmed'
  | 'within-24-hour-confirmation-period'
  | 'within-24-hour-grace-period'
  | 'waiting-for-verification'
  | 'long-overdue-for-confirmation'
  | 'occupied';

export type SearchPrioritySignal =
  | 'prefer-recently-confirmed'
  | 'prefer-verified-active-confirmations'
  | 'prefer-fresh-listings'
  | 'rank-waiting-for-verification-below-active-confirmations'
  | 'hide-after-one-week-unconfirmed'
  | 'restore-after-reconfirmation';

export interface VacancyNotificationScheduleItem {
  id: string;
  trigger: 'after-publication' | 'before-expiry-12-hours' | 'final-reminder-1-hour' | 'grace-period' | 'waiting-for-verification';
  message: string;
  repetitive: false;
}

export interface VacancyConfirmationIntelligenceSnapshot {
  freshnessStatus: VacancyFreshnessStatus;
  searchEligible: boolean;
  searchPrioritySignals: readonly SearchPrioritySignal[];
  oneWeekRemovalApplied: boolean;
  recoveryAvailableWithoutDuplicateRegistration: true;
  aiAdminAssistant: VacancyAiAdminAssistantMonitoring;
  platformHealthMonitor: VacancyPlatformHealthMonitoring;
  notifications: readonly VacancyNotificationScheduleItem[];
}

export interface VacancyAiAdminAssistantMonitoring {
  prepared: true;
  detectApproachingConfirmationExpiry: boolean;
  prioritizeOverdueConfirmations: boolean;
  identifyManagersWithRepeatedDelays: boolean;
  prepareRecommendationsForPlatformAdministrator: boolean;
  automaticallyRemoveListings: false;
  overrideConfirmationDecisions: false;
}

export interface VacancyPlatformHealthMonitoring {
  prepared: true;
  analyseVacancyConfirmationActivity: boolean;
  identifyAreasWithManyOverdueConfirmations: boolean;
  identifyManagersWhoFrequentlyMissConfirmations: boolean;
  identifyVerifiedPropertiesWaitingForConfirmation: boolean;
  identifyAreasWithHighConfirmationQuality: boolean;
  recommendationsOnly: true;
  automaticEnforcement: false;
  exampleRecommendations: readonly [
    'Five verified properties have not confirmed their vacancies recently. Review them to maintain customer trust.',
    'Kitengela has many overdue vacancy confirmations. Consider reminding Property Managers in this area.'
  ];
}

export const VACANCY_CONFIRMATION_INTELLIGENCE = {
  eventHallsExcluded: true,
  oneWeekRemovalAfterHours: 168,
  noDuplicateRegistrationForRecovery: true,
  searchBehaviour: {
    preferAccurateVacancies: true,
    fewMatchesMayStillShowRelevantProperties: true,
    betterFewRelevantThanNone: true,
    matchEngineLogicChangedHere: false
  },
  futureIntegrations: [
    'Property Verification',
    'House Match',
    'Shop Match',
    'Office Match',
    'Unlock This Listing',
    'Verified Access',
    'Viewing Workflow',
    'Notifications',
    'AI Admin Assistant',
    'Platform Health Monitor'
  ] as const
} as const;

export const VACANCY_CONFIRMATION_NOTIFICATION_SCHEDULE: readonly VacancyNotificationScheduleItem[] = [
  {
    id: 'confirmation-active-24-hours',
    trigger: 'after-publication',
    message: 'Your vacancy confirmation is active for the next 24 hours.',
    repetitive: false
  },
  {
    id: 'expires-in-12-hours',
    trigger: 'before-expiry-12-hours',
    message: 'Your vacancy confirmation expires in 12 hours.',
    repetitive: false
  },
  {
    id: 'expires-in-1-hour',
    trigger: 'final-reminder-1-hour',
    message: 'Your vacancy confirmation expires in 1 hour.',
    repetitive: false
  },
  {
    id: 'grace-awaiting-confirmation',
    trigger: 'grace-period',
    message: 'Your vacancy is awaiting confirmation. Please confirm to keep it active.',
    repetitive: false
  },
  {
    id: 'waiting-for-verification-no-confirmation',
    trigger: 'waiting-for-verification',
    message: 'Your vacancy is now waiting for verification because confirmation was not received within the required period.',
    repetitive: false
  }
] as const;

const HOUR_MS = 60 * 60 * 1000;
const RECENTLY_CONFIRMED_MS = 6 * HOUR_MS;
const ONE_WEEK_MS = 7 * 24 * HOUR_MS;

export function getVacancyFreshnessStatus(record: VacancyConfirmationRecord, at: Date = new Date()): VacancyFreshnessStatus {
  if (record.status === 'occupied') return 'occupied';
  const current = at.getTime();
  const confirmedAt = new Date(record.lastConfirmedAt).getTime();
  const activeUntil = new Date(record.activeUntil).getTime();
  const graceUntil = new Date(record.graceUntil).getTime();
  if (current - confirmedAt <= RECENTLY_CONFIRMED_MS) return 'recently-confirmed';
  if (current <= activeUntil) return 'within-24-hour-confirmation-period';
  if (current <= graceUntil) return 'within-24-hour-grace-period';
  if (current - confirmedAt > ONE_WEEK_MS) return 'long-overdue-for-confirmation';
  return 'waiting-for-verification';
}

export function buildVacancyIntelligenceSnapshot(record: VacancyConfirmationRecord, at: Date = new Date()): VacancyConfirmationIntelligenceSnapshot {
  const freshnessStatus = getVacancyFreshnessStatus(record, at);
  const oneWeekRemovalApplied = freshnessStatus === 'long-overdue-for-confirmation';
  const searchEligible = record.status !== 'occupied' && !oneWeekRemovalApplied && freshnessStatus !== 'waiting-for-verification';
  return {
    freshnessStatus,
    searchEligible,
    oneWeekRemovalApplied,
    recoveryAvailableWithoutDuplicateRegistration: true,
    searchPrioritySignals: [
      'prefer-recently-confirmed',
      'prefer-verified-active-confirmations',
      'prefer-fresh-listings',
      'rank-waiting-for-verification-below-active-confirmations',
      'hide-after-one-week-unconfirmed',
      'restore-after-reconfirmation'
    ],
    aiAdminAssistant: {
      prepared: true,
      detectApproachingConfirmationExpiry: true,
      prioritizeOverdueConfirmations: true,
      identifyManagersWithRepeatedDelays: true,
      prepareRecommendationsForPlatformAdministrator: true,
      automaticallyRemoveListings: false,
      overrideConfirmationDecisions: false
    },
    platformHealthMonitor: {
      prepared: true,
      analyseVacancyConfirmationActivity: true,
      identifyAreasWithManyOverdueConfirmations: true,
      identifyManagersWhoFrequentlyMissConfirmations: true,
      identifyVerifiedPropertiesWaitingForConfirmation: true,
      identifyAreasWithHighConfirmationQuality: true,
      recommendationsOnly: true,
      automaticEnforcement: false,
      exampleRecommendations: [
        'Five verified properties have not confirmed their vacancies recently. Review them to maintain customer trust.',
        'Kitengela has many overdue vacancy confirmations. Consider reminding Property Managers in this area.'
      ]
    },
    notifications: VACANCY_CONFIRMATION_NOTIFICATION_SCHEDULE
  };
}
