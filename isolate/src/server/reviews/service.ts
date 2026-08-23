import { randomUUID } from 'node:crypto';
import { REVIEW_CATEGORIES_BY_PROPERTY, detectSuspiciousReview, isValidStarRating, type PropertyRatingSummary, type PropertyReview, type PropertyReviewResponse, type ReviewCategoryRating, type ReviewReport, type StarRating } from '@/domain/reviews';
import { readViewingStore } from '@/server/viewings/store';
import { createNotification } from '@/server/notifications/service';
import { trackAnalyticsEvent } from '@/server/analytics/service';
import { readReviewStore, writeReviewStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

export async function isReviewEligible(input: { customerId: string; propertyId: string; unitIdentifier: string; viewingId: string; eventHasTakenPlace?: boolean }): Promise<{ eligible: boolean; reason?: string }> {
  const viewings = await readViewingStore();
  const viewing = viewings.viewings.find((item) => item.id === input.viewingId && item.customerId === input.customerId && item.target.propertyId === input.propertyId && item.target.unitIdentifier === input.unitIdentifier);
  if (!viewing) return { eligible: false, reason: 'A completed eligible interaction is required before reviewing.' };
  if (viewing.status !== 'completed') return { eligible: false, reason: 'Review becomes available after a completed viewing.' };
  if (viewing.propertyCategory === 'event-halls' && !input.eventHasTakenPlace) return { eligible: false, reason: 'Event Hall reviews become available after the event has taken place.' };
  return { eligible: true };
}

function validateCategoryRatings(propertyCategory: PropertyReview['propertyCategory'], ratings: ReviewCategoryRating[]): ReviewCategoryRating[] {
  const allowed = new Set(REVIEW_CATEGORIES_BY_PROPERTY[propertyCategory]);
  return ratings.filter((rating) => allowed.has(rating.category) && isValidStarRating(rating.rating));
}

export async function submitReview(input: { customerId: string; propertyId: string; unitIdentifier: string; viewingId: string; rating: number; categoryRatings: ReviewCategoryRating[]; writtenReview?: string; eventHasTakenPlace?: boolean }): Promise<{ ok: true; review: PropertyReview } | { ok: false; status: number; message: string }> {
  if (!isValidStarRating(input.rating)) return { ok: false, status: 400, message: 'Choose a rating from 1 to 5 stars.' };
  const eligible = await isReviewEligible(input);
  if (!eligible.eligible) return { ok: false, status: 403, message: eligible.reason ?? 'You are not eligible to review this property.' };
  const viewings = await readViewingStore();
  const viewing = viewings.viewings.find((item) => item.id === input.viewingId)!;
  const data = await readReviewStore();
  const existing = data.reviews.find((review) => review.customerId === input.customerId && review.propertyId === input.propertyId && review.unitIdentifier === input.unitIdentifier);
  if (existing) return { ok: false, status: 409, message: 'You have already reviewed this property or unit. You may edit your existing review.' };
  const moderationFlags = detectSuspiciousReview(input.writtenReview);
  const timestamp = nowIso();
  const review: PropertyReview = {
    id: randomUUID(),
    customerId: input.customerId,
    propertyId: input.propertyId,
    unitIdentifier: input.unitIdentifier,
    propertyCategory: viewing.propertyCategory,
    viewingId: input.viewingId,
    verifiedInteraction: true,
    rating: input.rating,
    categoryRatings: validateCategoryRatings(viewing.propertyCategory, input.categoryRatings),
    writtenReview: input.writtenReview,
    status: moderationFlags.length ? 'flagged-for-moderation' : 'published',
    moderationFlags,
    reports: [],
    editHistory: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  data.reviews.push(review);
  await writeReviewStore(data);
  await trackAnalyticsEvent({ eventType: 'review-submitted', actorUserId: input.customerId, actorRole: 'customer', propertyId: input.propertyId, propertyCategory: review.propertyCategory });
  return { ok: true, review };
}

export async function editReview(input: { reviewId: string; customerId: string; rating: number; categoryRatings: ReviewCategoryRating[]; writtenReview?: string }): Promise<PropertyReview | null> {
  if (!isValidStarRating(input.rating)) return null;
  const data = await readReviewStore();
  const review = data.reviews.find((item) => item.id === input.reviewId && item.customerId === input.customerId);
  if (!review) return null;
  review.editHistory.push({ editedAt: nowIso(), rating: review.rating, writtenReview: review.writtenReview, categoryRatings: review.categoryRatings });
  review.rating = input.rating;
  review.categoryRatings = validateCategoryRatings(review.propertyCategory, input.categoryRatings);
  review.writtenReview = input.writtenReview;
  review.moderationFlags = detectSuspiciousReview(input.writtenReview);
  review.status = review.moderationFlags.length ? 'flagged-for-moderation' : 'published';
  review.updatedAt = nowIso();
  await writeReviewStore(data);
  return review;
}

export async function respondToReview(input: { reviewId: string; responderId: string; responderRole: PropertyReviewResponse['responderRole']; response: string }): Promise<PropertyReview | null> {
  const data = await readReviewStore();
  const review = data.reviews.find((item) => item.id === input.reviewId);
  if (!review || review.officialResponse) return null;
  review.officialResponse = { responderId: input.responderId, responderRole: input.responderRole, response: input.response, respondedAt: nowIso(), professional: true };
  review.updatedAt = nowIso();
  await writeReviewStore(data);
  await createNotification({ recipientUserId: review.customerId, recipientRole: 'customer', audience: 'customer', eventType: 'review-response-received', eventKey: `review-response:${review.id}`, title: 'Review response received.', shortDescription: 'A property contact responded to your review.', related: { propertyId: review.propertyId, unitIdentifier: review.unitIdentifier, propertyCategory: review.propertyCategory, reviewId: review.id } });
  return review;
}

export async function reportReview(input: { reviewId: string; reporterId: string; reporterRole: string; reason: string }): Promise<PropertyReview | null> {
  const data = await readReviewStore();
  const review = data.reviews.find((item) => item.id === input.reviewId);
  if (!review) return null;
  const report: ReviewReport = { id: randomUUID(), reporterId: input.reporterId, reporterRole: input.reporterRole, reason: input.reason, reportedAt: nowIso(), submittedForModeration: true };
  review.reports.push(report);
  review.status = 'flagged-for-moderation';
  review.updatedAt = nowIso();
  await writeReviewStore(data);
  return review;
}

export async function getReviewsForProperty(propertyId: string): Promise<{ reviews: PropertyReview[]; summary: PropertyRatingSummary }> {
  const data = await readReviewStore();
  const reviews = data.reviews.filter((review) => review.propertyId === propertyId && review.status !== 'hidden-after-moderation');
  const total = reviews.length;
  const average = total ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10) / 10 : 0;
  return { reviews, summary: { propertyId, averageRating: average, totalReviews: total, visibleOnPublicCards: true } };
}
