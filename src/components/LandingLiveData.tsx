'use client';

import { useEffect, useState } from 'react';

interface FeaturedListing {
  id: string;
  category: string;
  categoryName: string;
  icon: string;
  name: string;
  location: string;
  description: string;
  unitIdentifier?: string;
  unlockPrice: number;
  currency: string;
}

interface LandingReview {
  id: string;
  rating: number;
  writtenReview?: string;
  propertyCategory: string;
  createdAt: string;
}

export function FeaturedPropertiesLive() {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockModal, setUnlockModal] = useState<FeaturedListing | null>(null);

  useEffect(() => {
    fetch('/api/landing/featured')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setListings(data.featured);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="featured-properties-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="featured-property-card" style={{ minHeight: '220px' }}>
            <div className="skeleton-card" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No verified listings yet</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Featured properties will appear here once property owners register and verify their listings.
        </p>
        <a className="pill-btn pill-btn-accent" href="/properties/register" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Be the first to list
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="featured-properties-grid">
        {listings.map((property, i) => (
          <div key={property.id} className="featured-property-card premium-stagger" data-stagger-index={String(i)}>
            <div className="featured-property-header">
              <span className="featured-property-type">{property.icon} {property.categoryName}</span>
              <span className="featured-property-verified">✓ Verified</span>
            </div>
            <h3>{property.name}</h3>
            <p className="featured-property-location">{property.location}</p>
            {property.unitIdentifier && (
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>Unit: {property.unitIdentifier}</p>
            )}
            <button
              className="pill-btn pill-btn-dark featured-property-cta"
              onClick={() => setUnlockModal(property)}
              style={{ marginTop: '0.75rem', cursor: 'pointer' }}
            >
              Unlock this listing — KES {property.unlockPrice.toLocaleString()}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        ))}
      </div>

      {unlockModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={() => setUnlockModal(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 'var(--premium-radius)', padding: '2rem',
              maxWidth: '28rem', width: '100%', position: 'relative',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setUnlockModal(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                color: 'var(--muted)', lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{unlockModal.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{unlockModal.categoryName}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>{unlockModal.location}</p>
            </div>
            <div style={{
              background: 'var(--surface-strong)', borderRadius: 'var(--premium-radius)',
              padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem',
            }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 0.5rem' }}>
                Unlock price for this listing
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-dark)', margin: 0, letterSpacing: '-0.02em' }}>
                KES {unlockModal.unlockPrice.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>
                24-hour access · One unit only
              </p>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Unlocking gives you 24-hour access to this property&apos;s full details including photos,
              contact numbers, and the ability to request a viewing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setUnlockModal(null)}
                className="pill-btn pill-btn-ghost"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                Not now
              </button>
              <a
                href={`/match/${unlockModal.category === 'event-halls' ? 'event-hall' : unlockModal.category}`}
                className="pill-btn pill-btn-dark"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Continue to search
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TestimonialsLive() {
  const [reviews, setReviews] = useState<LandingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/landing/reviews')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="testimonials-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="testimonial-card" style={{ minHeight: '200px' }}>
            <div className="skeleton-card" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No reviews yet</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Reviews from real Kenyans will appear here after they view and review properties.
        </p>
      </div>
    );
  }

  const CATEGORY_LABELS: Record<string, string> = {
    houses: 'House',
    shops: 'Shop',
    offices: 'Office',
    'event-halls': 'Event Hall',
  };

  return (
    <div className="testimonials-grid">
      {reviews.slice(0, 6).map((review, i) => (
        <div key={review.id} className="testimonial-card premium-stagger" data-stagger-index={String(i)}>
          <div className="testimonial-stars" aria-label={`${review.rating} stars`}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          {review.writtenReview && (
            <p className="testimonial-text">&ldquo;{review.writtenReview}&rdquo;</p>
          )}
          <div className="testimonial-author">
            <div>
              <div className="testimonial-name">PataSpace Customer</div>
              <div className="testimonial-role">
                {CATEGORY_LABELS[review.propertyCategory] || review.propertyCategory} · {new Date(review.createdAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
