'use client';

import { useEffect, useState } from 'react';

interface LandingReview {
  id: string;
  rating: number;
  writtenReview?: string;
  propertyCategory: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  houses: 'House',
  shops: 'Shop',
  offices: 'Office',
  'event-halls': 'Event hall'
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
}

export function AtlasReviews() {
  const [reviews, setReviews] = useState<LandingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/landing/reviews')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.reviews)) {
          setReviews(data.reviews.slice(0, 6));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="ps-reviews" aria-busy="true" aria-label="Loading reviews">
        {[0, 1, 2].map((item) => (
          <div key={item} className="ps-skeleton" style={{ minHeight: 238 }} />
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="ps-reviews">
        <div className="ps-reviews__empty">
          <div>
            <h3>The first word belongs to you.</h3>
            <p>
              Verified reviews appear here after a real customer completes a real viewing. We do not write testimonials,
              buy them, or place them before they happen.
            </p>
          </div>
          <ul className="ps-reviews__rules">
            <li>One review per customer and unit</li>
            <li>Only after a completed viewing</li>
            <li>Right of reply for property owners</li>
            <li>Reported reviews are reviewed by a person</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-reviews">
      {reviews.map((review) => (
        <article key={review.id} className="ps-review">
          <div className="ps-review__stars" aria-label={`${review.rating} out of 5 stars`}>
            <span aria-hidden="true">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(Math.max(0, 5 - review.rating))}
            </span>
          </div>
          {review.writtenReview ? <p className="ps-review__text">“{review.writtenReview}”</p> : null}
          <div className="ps-review__meta">
            <span>PataSpace customer · {CATEGORY_LABELS[review.propertyCategory] ?? review.propertyCategory}</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
