'use client';

import { useMemo, useState } from 'react';
import { getQuestionsForCategory } from '@/domain/guided-interviews';
import { PROPERTY_CATEGORIES } from '@/domain/property-categories';
import type { PropertyCategoryId } from '@/domain/types';

const DEFAULT_CATEGORY: PropertyCategoryId = 'houses';

export function GuidedSearch() {
  const [category, setCategory] = useState<PropertyCategoryId>(DEFAULT_CATEGORY);
  const questions = useMemo(() => getQuestionsForCategory(category), [category]);
  const selectedCategory = PROPERTY_CATEGORIES.find((item) => item.id === category);

  return (
    <section className="guided-card" aria-labelledby="guided-title">
      <div className="section-eyebrow">Guided rental discovery</div>
      <h2 id="guided-title">Answer a few clear questions. See better matches.</h2>
      <p>
        PataSpace uses structured interviews instead of open-ended chats. Choose a rental category and the
        interview keeps only relevant questions visible.
      </p>

      <div className="category-grid" role="radiogroup" aria-label="Property category">
        {PROPERTY_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === category ? 'category-option active' : 'category-option'}
            onClick={() => setCategory(item.id)}
            role="radio"
            aria-checked={item.id === category}
          >
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </div>

      <div className="interview-panel">
        <div>
          <span className="badge">Kenya only</span>
          <h3>{selectedCategory?.label} interview path</h3>
        </div>
        <ol className="question-list">
          {questions.map((question) => (
            <li key={question.id}>
              <strong>{question.label}</strong>
              <span>{question.helperText}</span>
              {question.options ? <em>{question.options.join(' · ')}</em> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
