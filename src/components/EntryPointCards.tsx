'use client';

import { useState } from 'react';
import { OFFICIAL_ENTRY_POINTS, type OfficialEntryPoint, type OfficialEntryPointId } from '@/domain/brand';

const DEFAULT_ENTRY: OfficialEntryPointId = 'find-my-home';
const WORKFLOW_ROUTES: Record<OfficialEntryPointId, string> = {
  'find-my-home': '/match/house',
  'find-my-shop': '/match/shop',
  'find-my-office': '/match/office',
  'find-my-hall': '/match/event-hall'
};

export function EntryPointCards() {
  const [selectedEntry, setSelectedEntry] = useState<OfficialEntryPointId>(DEFAULT_ENTRY);
  const selected: OfficialEntryPoint = OFFICIAL_ENTRY_POINTS.find((entry) => entry.id === selectedEntry) ?? OFFICIAL_ENTRY_POINTS[0];

  return (
    <section className="entry-panel search-first-panel" aria-labelledby="entry-title">
      <div className="entry-heading">
        <span className="section-eyebrow">Start here</span>
        <h2 id="entry-title">What would you like to find?</h2>
        <p>Choose one guided path. PataSpace will ask only what matters and prepare better matches faster.</p>
      </div>

      <div className="entry-grid" aria-label="Official PataSpace entry points">
        {OFFICIAL_ENTRY_POINTS.map((entry) => (
          <a
            key={entry.id}
            className={entry.id === selectedEntry ? 'entry-card active' : 'entry-card'}
            href={WORKFLOW_ROUTES[entry.id]}
            onFocus={() => setSelectedEntry(entry.id)}
            onMouseEnter={() => setSelectedEntry(entry.id)}
            aria-label={`${entry.label}. Opens ${entry.matchWorkflow}`}
          >
            <span className="entry-icon" aria-hidden="true">{entry.icon}</span>
            <span className="entry-label">{entry.label}</span>
            <small>{entry.description}</small>
          </a>
        ))}
      </div>

      <div className="feedback-panel" role="status" aria-live="polite">
        <span className="badge">Ready</span>
        <p>
          {selected.label} opens the {selected.matchWorkflow} guided workflow for verified rental listings in Kenya.
        </p>
      </div>
    </section>
  );
}
