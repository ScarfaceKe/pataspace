'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CategoryGlyph, PinIcon } from '@/components/landing/glyphs';
import type { PropertyCategoryId } from '@/domain/types';

interface FeaturedListing {
  id: string;
  category: string;
  categoryName: string;
  name: string;
  location: string;
  description: string;
  unitIdentifier?: string;
  unlockPrice: number;
  currency: string;
}

const MATCH_ROUTES: Record<string, string> = {
  houses: '/match/house',
  shops: '/match/shop',
  offices: '/match/office',
  'event-halls': '/match/event-hall'
};

function categoryKey(value: string) {
  return value === 'mixed-use-building' ? 'mixed-use-building' : value;
}

export function AtlasFeatured() {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<FeaturedListing | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/landing/featured')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.featured)) {
          setListings(data.featured.slice(0, 3));
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

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(null);
        return;
      }
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [active]);

  if (loading) {
    return (
      <div className="ps-listings__grid" aria-busy="true" aria-label="Loading featured listings">
        {[0, 1, 2].map((item) => (
          <div key={item} className="ps-skeleton" />
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="ps-ledger">
        <div>
          <h3>Every board starts empty.</h3>
          <p>
            This one is waiting for its first verified space. Listings appear only after a property is checked and its
            vacancy is confirmed — never before.
          </p>
          <div className="ps-ledger__actions">
            <a className="ps-btn ps-btn--ink" href="/properties/register">
              List your property
              <ArrowRight />
            </a>
            <a className="ps-btn ps-btn--outline" href="#standard">
              How verification works
            </a>
          </div>
        </div>
        <div className="ps-ledger__side">
          <b>What earns a place</b>
          Verified by a person
          <br />
          Vacancy confirmed
          <br />
          Honest rent and deposit
          <br />
          Real photos, real address
          <br />
          Kenya only
        </div>
      </div>
    );
  }

  const route = active ? MATCH_ROUTES[active.category] ?? '/match/house' : '/match/house';

  return (
    <>
      <div className="ps-listings__grid">
        {listings.map((listing, index) => (
          <article key={listing.id} className="ps-listing">
            <div className="ps-listing__media" data-category={categoryKey(listing.category)}>
              <span className="ps-listing__num">0{index + 1} / PataSpace</span>
              <span className="ps-listing__stamp">Verified</span>
              <span className="ps-listing__cat">
                <CategoryGlyph category={listing.category as PropertyCategoryId} />
                {listing.categoryName}
              </span>
            </div>
            <div className="ps-listing__body">
              <h3 className="ps-listing__title">{listing.name}</h3>
              <p className="ps-listing__loc">
                <PinIcon />
                {listing.location}
              </p>
              <div className="ps-listing__price">
                <span>
                  {listing.currency} {listing.unlockPrice.toLocaleString()}
                </span>
                <small>to unlock · 24 hrs</small>
              </div>
              <button type="button" className="ps-listing__cta" onClick={() => setActive(listing)}>
                Unlock this listing
                <ArrowRight />
              </button>
            </div>
          </article>
        ))}
      </div>

      {active ? (
        <div className="ps-modal" role="presentation" onClick={() => setActive(null)}>
          <div
            className="ps-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ps-modal-title"
            aria-describedby="ps-modal-copy"
            ref={dialogRef}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="ps-modal__close"
              onClick={() => setActive(null)}
              aria-label="Close listing"
              ref={closeRef}
            >
              ×
            </button>
            <div className="ps-modal__label">
              <span>{active.categoryName} · PataSpace verified</span>
              <span>{active.unitIdentifier ? `Unit ${active.unitIdentifier}` : 'Single unit'}</span>
            </div>
            <h2 className="ps-modal__title" id="ps-modal-title">
              {active.name}
            </h2>
            <p className="ps-modal__loc">
              <PinIcon />
              {active.location}
            </p>
            <div className="ps-modal__price">
              <b>
                {active.currency} {active.unlockPrice.toLocaleString()}
              </b>
              <span>24-hour access · one unit</span>
            </div>
            <p className="ps-modal__copy" id="ps-modal-copy">
              Unlocking gives you full details for this unit — photos, verified contact information, and the ability to
              request a viewing. Payment is confirmed before access opens.
            </p>
            <div className="ps-modal__actions">
              <button type="button" className="ps-btn ps-btn--outline" onClick={() => setActive(null)}>
                Not now
              </button>
              <a className="ps-btn ps-btn--ink" href={route}>
                Continue to match
                <ArrowRight />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
