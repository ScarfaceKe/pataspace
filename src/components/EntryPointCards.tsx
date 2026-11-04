'use client';

import { useState } from 'react';
import { OFFICIAL_ENTRY_POINTS, type OfficialEntryPoint, type OfficialEntryPointId } from '@/domain/brand';
import { ArrowRight, CategoryGlyph } from '@/components/landing/glyphs';

const DEFAULT_ENTRY: OfficialEntryPointId = 'find-my-home';

const WORKFLOW_ROUTES: Record<OfficialEntryPointId, string> = {
  'find-my-home': '/match/house',
  'find-my-shop': '/match/shop',
  'find-my-office': '/match/office',
  'find-my-hall': '/match/event-hall'
};

const CARD_VARIANTS = ['ps-entry__card--paper', 'ps-entry__card--ink', 'ps-entry__card--ochre', 'ps-entry__card--clay'];

export function EntryPointCards() {
  const [selectedEntry, setSelectedEntry] = useState<OfficialEntryPointId>(DEFAULT_ENTRY);
  const selected: OfficialEntryPoint =
    OFFICIAL_ENTRY_POINTS.find((entry) => entry.id === selectedEntry) ?? OFFICIAL_ENTRY_POINTS[0];

  return (
    <section className="ps-entry" id="entry-choices" aria-labelledby="entry-choices-title">
      <h2 className="ps-sr-only" id="entry-choices-title">
        What would you like to find?
      </h2>
      <div className="ps-entry__grid" aria-label="Official PataSpace entry points">
        {OFFICIAL_ENTRY_POINTS.map((entry, index) => (
          <a
            key={entry.id}
            className={`ps-entry__card ${CARD_VARIANTS[index] ?? CARD_VARIANTS[0]}${
              entry.id === selectedEntry ? ' active' : ''
            }`}
            href={WORKFLOW_ROUTES[entry.id]}
            onFocus={() => setSelectedEntry(entry.id)}
            onMouseEnter={() => setSelectedEntry(entry.id)}
            aria-label={`${entry.label}. Opens ${entry.matchWorkflow}`}
          >
            <span className="ps-entry__top">
              <span className="ps-entry__index">0{index + 1} / 04</span>
              <CategoryGlyph category={entry.categoryId} className="ps-entry__icon" />
            </span>
            <span className="ps-entry__label">{entry.label}</span>
            <span className="ps-entry__desc">{entry.description}</span>
            <span className="ps-entry__go">
              Open {entry.matchWorkflow}
              <ArrowRight />
            </span>
          </a>
        ))}
      </div>

      <div className="ps-entry__feedback" role="status" aria-live="polite">
        <span className="ps-entry__dot" aria-hidden="true" />
        <p>
          {selected.label} opens the {selected.matchWorkflow} — verified rental listings, Kenya only.
        </p>
      </div>
    </section>
  );
}
