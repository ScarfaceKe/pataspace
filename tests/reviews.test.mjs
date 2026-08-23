import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/reviews.ts', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/server/reviews/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const category of ['Houses','Shops','Offices','Event Halls']) assert.ok(domain.includes(category), `Reviews apply to ${category}`);
assert.ok(domain.includes('requiresEligibleInteraction: true'), 'Eligible interaction required');
assert.ok(service.includes('viewing.status !== \'completed\''), 'Completed viewing eligibility missing');
assert.ok(service.includes('Event Hall reviews become available after the event has taken place.'), 'Event Hall event-date rule missing');
assert.ok(domain.includes('oneReviewPerCustomerPropertyOrUnit: true'), 'One review per customer/unit missing');
assert.ok(service.includes('You have already reviewed this property or unit'), 'Duplicate review prevention missing');
for (const rating of ['1','2','3','4','5']) assert.ok(domain.includes(rating), `Star rating ${rating} missing`);
for (const cat of ['accuracy-of-listing','cleanliness','property-condition','security','accessibility','value-for-money','customer-service','communication','overall-experience']) assert.ok(domain.includes(cat), `Review category ${cat} missing`);
assert.ok(domain.includes('writtenReviewOptional: true'), 'Written review optional missing');
assert.ok(service.includes('detectSuspiciousReview'), 'Moderation detection missing');
assert.ok(domain.includes('Offensive language') && domain.includes('Spam or repeated content') && domain.includes('Repeated promotional content'), 'Moderation examples missing');
assert.ok(domain.includes('automaticallyDeletesLegitimateFeedback: false'), 'AI Admin must not auto-delete legitimate feedback');
assert.ok(service.includes('respondToReview'), 'Property response missing');
assert.ok(service.includes('officialResponse'), 'Official response storage missing');
assert.ok(service.includes('editHistory'), 'Review edit history missing');
assert.ok(service.includes('reportReview'), 'Reporting reviews missing');
assert.ok(domain.includes('submittedForModeration: true'), 'Reported reviews should go to moderation');
assert.ok(service.includes('averageRating') && service.includes('totalReviews'), 'Overall rating summary missing');
assert.ok(domain.includes('verifiedInteraction: true'), 'Verified review indicator missing');
assert.ok(domain.includes('neverOverridesMatchRankingWithoutFutureFounderApproval: true'), 'Review impact must not override rankings');
assert.ok(domain.includes('customersEditOnlyOwnReviews: true'), 'Customer edit security missing');
assert.ok(domain.includes('registrantsRespondOnlyToOwnPropertyReviews: true'), 'Registrant response security missing');
assert.ok(foundation.includes('reviews: REVIEWS_FOUNDATION'), 'Foundation snapshot must expose reviews');
assert.ok(dashboard.includes('/dashboard/reviews'), 'Dashboard must link reviews');

console.log('PataSpace reviews checks passed.');
