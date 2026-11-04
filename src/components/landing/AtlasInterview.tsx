'use client';

import { useMemo, useState } from 'react';
import { getQuestionsForCategory } from '@/domain/guided-interviews';
import { PROPERTY_CATEGORIES } from '@/domain/property-categories';
import type { PropertyCategoryId } from '@/domain/types';
import { ArrowRight, CategoryGlyph } from '@/components/landing/glyphs';

const MATCH_ROUTES: Record<PropertyCategoryId, string> = {
  houses: '/match/house',
  shops: '/match/shop',
  offices: '/match/office',
  'event-halls': '/match/event-hall',
  'mixed-use-building': '/match/house'
};

const SHORT_NAMES: Record<PropertyCategoryId, string> = {
  houses: 'House match',
  shops: 'Shop match',
  offices: 'Office match',
  'event-halls': 'Hall match',
  'mixed-use-building': 'Mixed-use match'
};

const INTERVIEW_CATEGORIES = PROPERTY_CATEGORIES.filter((category) =>
  ['houses', 'shops', 'offices', 'event-halls'].includes(category.id)
);

export function AtlasInterview() {
  const [category, setCategory] = useState<PropertyCategoryId>('houses');
  const questions = useMemo(() => getQuestionsForCategory(category), [category]);
  const selectedCategory = PROPERTY_CATEGORIES.find((item) => item.id === category) ?? PROPERTY_CATEGORIES[0];
  const preview = questions.slice(0, 4);

  return (
    <div className="ps-interview">
      <div className="ps-interview__tabs" role="group" aria-label="Choose a rental category">
        {INTERVIEW_CATEGORIES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === category}
            aria-controls="ps-interview-panel"
            className="ps-interview__tab"
            onClick={() => setCategory(item.id)}
          >
            <span className="ps-interview__tabNo">0{index + 1}</span>
            <CategoryGlyph category={item.id} className="ps-interview__glyph" />
            <span className="ps-interview__tabName">{item.label}</span>
            <span className="ps-interview__tabMeta">{SHORT_NAMES[item.id]}</span>
          </button>
        ))}
      </div>

      <div className="ps-interview__panel" id="ps-interview-panel" data-category={category}>
        <div className="ps-interview__panelHead">
          <span className="ps-label ps-label--bare">{selectedCategory.label} interview path</span>
          <span className="ps-interview__count">{questions.length} questions · Kenya only</span>
        </div>

        <ol className="ps-questions">
          {preview.map((question, index) => (
            <li key={question.id} className="ps-question">
              <span className="ps-question__no">0{index + 1}</span>
              <div className="ps-question__body">
                <h3>{question.label}</h3>
                <p>{question.helperText}</p>
                {question.options ? (
                  <div className="ps-question__options">
                    {question.options.slice(0, 4).map((option) => (
                      <span key={option}>{option}</span>
                    ))}
                    {question.options.length > 4 ? <span>+ more</span> : null}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <p className="ps-interview__note">
          Each answer decides the next question. Nothing irrelevant is ever shown.
        </p>

        <div className="ps-interview__cta">
          <a className="ps-btn ps-btn--ink ps-btn--wide" href={MATCH_ROUTES[category]}>
            Start the {selectedCategory.label.toLowerCase()} interview
            <ArrowRight />
          </a>
        </div>
      </div>
    </div>
  );
}
