import type { VacancyConfirmationIntelligenceSnapshot } from './vacancy-confirmation-intelligence';
import type { PropertyCategoryId } from './types';

export type VacancyConfirmationPropertyCategory = Extract<PropertyCategoryId, 'houses' | 'shops' | 'offices'>;
export type VacancyConfirmationStatus = 'confirmed-vacancy' | 'grace-period' | 'waiting-for-verification' | 'occupied';
export type VacancyConfirmationAction = 'confirm-still-vacant' | 'mark-occupied' | 'reconfirm-after-waiting';

export interface VacancyConfirmationRecord {
  id: string;
  propertyId: string;
  sourceRegistrationId: string;
  category: VacancyConfirmationPropertyCategory;
  unitIdentifier: string;
  status: VacancyConfirmationStatus;
  lastConfirmedAt: string;
  activeUntil: string;
  graceUntil: string;
  reminderDueAt: string;
  reminderPrepared: boolean;
  visibleInCustomerSearch: boolean;
  unlockThisListingAvailable: boolean;
  verifiedAccessAvailable: boolean;
  viewingRequestsAvailable: boolean;
  confirmationHistory: VacancyConfirmationHistoryEntry[];
  intelligence: VacancyConfirmationIntelligenceSnapshot;
  createdAt: string;
  updatedAt: string;
  occupiedAt?: string;
  waitingForVerificationAt?: string;
}

export interface VacancyConfirmationHistoryEntry {
  action: VacancyConfirmationAction;
  at: string;
  note: string;
}

export const DAILY_VACANCY_CONFIRMATION_FOUNDATION = {
  appliesTo: ['houses', 'shops', 'offices'] as const,
  excludes: ['event-halls'] as const,
  verificationRelationship: {
    differentFromPropertyVerification: true,
    propertyVerificationPurpose: 'Confirms the legitimacy of the property.',
    vacancyConfirmationPurpose: 'Confirms that the advertised vacancy still exists.'
  },
  initialStatus: 'confirmed-vacancy',
  activeWindowHours: 24,
  gracePeriodHours: 24,
  waitingForVerificationAfterTotalHours: 48,
  independentUnitConfirmation: true,
  noDuplicateRegistrationRequiredForReconfirmation: true,
  userExperience: 'As few taps as possible; quick, simple and effortless.',
  searchRestrictionWhenOccupied: {
    visibleInCustomerSearch: false,
    unlockThisListingAvailable: false,
    verifiedAccessAvailable: false
  },
  futureIntelligenceInPrompt10B: [
    'Search Priority behaviour',
    'AI Admin Assistant monitoring',
    'Platform Health Monitor integration',
    'One-week removal rule',
    'Recovery after reconfirmation',
    'Previously approved ranking behaviour'
  ] as const
} as const;

export const VACANCY_CONFIRMATION_NOTIFICATIONS = {
  reminder: 'Please confirm that this vacancy is still available.',
  confirmed: 'Vacancy confirmed for another 24 hours.',
  waitingForVerification: 'This vacancy is now Waiting for Verification.',
  occupied: 'This vacancy has been marked as occupied.'
} as const;

export function isVacancyConfirmationCategory(category: PropertyCategoryId): category is VacancyConfirmationPropertyCategory {
  return category === 'houses' || category === 'shops' || category === 'offices';
}
