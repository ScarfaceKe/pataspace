import { requireCurrentUser } from '@/server/auth/current-user';
import { readReviewStore } from '@/server/reviews/store';
export const metadata = { title: 'Reviews — PataSpace' };
export default async function ReviewsDashboardPage() {
  const profile = await requireCurrentUser();
  const data = await readReviewStore();
  const reviews = data.reviews.filter((review) => review.customerId === profile.userId || review.officialResponse?.responderId === profile.userId);
  return <main className="dashboard-page"><section className="dashboard-card"><span className="badge">Reviews</span><h1>Reviews & Ratings</h1><p>Eligible reviews and official responses appear here.</p><div className="role-list">{reviews.map((review)=><article key={review.id}><h3>{'⭐'.repeat(review.rating)} · {review.unitIdentifier}</h3><p>{review.propertyCategory} · {review.status}</p><p>{review.writtenReview ?? 'No written review.'}</p>{review.officialResponse ? <p>Response: {review.officialResponse.response}</p> : null}</article>)}{!reviews.length ? <article><h3>No reviews yet</h3><p>Reviews become available after eligible property interactions.</p></article> : null}</div></section></main>;
}
