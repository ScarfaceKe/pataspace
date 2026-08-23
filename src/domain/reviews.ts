import type { PropertyCategoryId } from './types';

export type StarRating = 1 | 2 | 3 | 4 | 5;
export type ReviewStatus = 'published' | 'flagged-for-moderation' | 'hidden-after-moderation';
export type ReviewCategoryId =
  | 'accuracy-of-listing'
  | 'cleanliness'
  | 'property-condition'
  | 'security'
  | 'accessibility'
  | 'value-for-money'
  | 'customer-service'
  | 'communication'
  | 'overall-experience';

export interface ReviewCategoryRating { category: ReviewCategoryId; rating: StarRating }
export interface ReviewEditHistoryEntry { editedAt: string; rating: StarRating; writtenReview?: string; categoryRatings: ReviewCategoryRating[] }
export interface ReviewModerationFlag { reason: string; flaggedAt: string; aiAdminAssistantFlag: boolean }
export interface ReviewReport { id: string; reporterId: string; reporterRole: string; reason: string; reportedAt: string; submittedForModeration: true }
export interface PropertyReviewResponse { responderId: string; responderRole: 'property-owner' | 'property-manager' | 'leasing-agent'; response: string; respondedAt: string; professional: true }

export interface PropertyReview {
  id: string;
  customerId: string;
  propertyId: string;
  unitIdentifier: string;
  propertyCategory: PropertyCategoryId;
  viewingId: string;
  verifiedInteraction: true;
  rating: StarRating;
  categoryRatings: ReviewCategoryRating[];
  writtenReview?: string;
  status: ReviewStatus;
  moderationFlags: ReviewModerationFlag[];
  reports: ReviewReport[];
  officialResponse?: PropertyReviewResponse;
  editHistory: ReviewEditHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyRatingSummary { propertyId: string; averageRating: number; totalReviews: number; visibleOnPublicCards: true }

export const REVIEW_CATEGORIES_BY_PROPERTY: Record<PropertyCategoryId, readonly ReviewCategoryId[]> = {
  houses: ['accuracy-of-listing', 'cleanliness', 'property-condition', 'security', 'accessibility', 'value-for-money', 'customer-service', 'communication', 'overall-experience'],
  shops: ['accuracy-of-listing', 'property-condition', 'security', 'accessibility', 'value-for-money', 'customer-service', 'communication', 'overall-experience'],
  offices: ['accuracy-of-listing', 'cleanliness', 'property-condition', 'security', 'accessibility', 'value-for-money', 'customer-service', 'communication', 'overall-experience'],
  'event-halls': ['accuracy-of-listing', 'cleanliness', 'property-condition', 'security', 'accessibility', 'value-for-money', 'customer-service', 'communication', 'overall-experience'],
  'mixed-use-building': ['accuracy-of-listing', 'cleanliness', 'property-condition', 'security', 'accessibility', 'value-for-money', 'customer-service', 'communication', 'overall-experience']
};

export const REVIEWS_FOUNDATION = {
  appliesTo: ['Houses', 'Shops', 'Offices', 'Event Halls'] as const,
  requiresEligibleInteraction: true,
  oneReviewPerCustomerPropertyOrUnit: true,
  starRatings: [1, 2, 3, 4, 5] as const,
  writtenReviewOptional: true,
  officialResponseLimit: 'one official response per review',
  eventHallRule: 'Event Hall reviews become available only after the event has taken place.',
  aiAdminAssistantModeration: { flagsSuspiciousReviews: true, automaticallyDeletesLegitimateFeedback: false },
  reviewImpact: { contributesToReputation: true, neverOverridesMatchRankingWithoutFutureFounderApproval: true },
  reportsGoToModerationNotImmediateRemoval: true,
  security: {
    customersReviewOnlyEligibleProperties: true,
    customersEditOnlyOwnReviews: true,
    registrantsRespondOnlyToOwnPropertyReviews: true,
    everyActionSecurelyRecorded: true
  }
} as const;

export function isValidStarRating(value: number): value is StarRating { return [1,2,3,4,5].includes(value); }

export function detectSuspiciousReview(text: string | undefined): ReviewModerationFlag[] {
  const flags: ReviewModerationFlag[] = [];
  const value = (text ?? '').toLowerCase();
  const offensive = ['idiot', 'stupid', 'hate'];
  if (offensive.some((word) => value.includes(word))) flags.push({ reason: 'Offensive language', flaggedAt: new Date().toISOString(), aiAdminAssistantFlag: true });
  if (/(.)\1{8,}/.test(value)) flags.push({ reason: 'Spam or repeated content', flaggedAt: new Date().toISOString(), aiAdminAssistantFlag: true });
  if (value.includes('buy now') || value.includes('promo')) flags.push({ reason: 'Repeated promotional content', flaggedAt: new Date().toISOString(), aiAdminAssistantFlag: true });
  return flags;
}
