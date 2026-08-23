'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = [
  '.hero-copy',
  '.entry-panel',
  '.mission-card',
  '.content-section',
  '.guided-card',
  '.property-registration-card',
  '.auth-card',
  '.dashboard-card',
  '.info-card',
  '.property-result-card',
  '.review-summary-card',
  '.profile-summary > div',
  '.dashboard-actions > *',
  '.customer-choice-card',
  '.premium-reveal',
  '.premium-stagger',
  '.premium-card'
].join(',');

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldUseLiteMotion(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData || connection?.effectiveType === '2g' || navigator.hardwareConcurrency <= 4);
}

/** Split text into words wrapped in spans for word-by-word reveal */
function prepareWordReveal(el: HTMLElement) {
  if (el.dataset.wordReveal === 'true') return;
  el.dataset.wordReveal = 'true';
  const text = el.textContent || '';
  const words = text.split(/\s+/).filter(Boolean);
  el.innerHTML = words
    .map((word, i) => `<span class="word-reveal-item" style="display:inline-block;opacity:0;transform:translateY(14px);transition:opacity 0.6s cubic-bezier(0.165,0.84,0.44,1) ${i * 35}ms, transform 0.6s cubic-bezier(0.165,0.84,0.44,1) ${i * 35}ms">${word}</span>`)
    .join(' ');
}

/** Split text into lines wrapped in overflow-hidden spans for line-by-line reveal */
function prepareLineReveal(el: HTMLElement) {
  if (el.dataset.lineReveal === 'true') return;
  el.dataset.lineReveal = 'true';
  const text = el.textContent || '';
  el.innerHTML = `<span style="display:inline-block;overflow:hidden"><span style="display:block;transform:translateY(100%);opacity:0;transition:opacity 0.9s cubic-bezier(0.215,0.61,0.355,1), transform 0.9s cubic-bezier(0.215,0.61,0.355,1)">${text}</span></span>`;
}

function activateReveals(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const inner = el.querySelector('span');
  if (inner) {
    inner.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
  }
}

function activateWordReveal(el: Element) {
  Array.from(el.querySelectorAll('.word-reveal-item')).forEach((item) => {
    if (item instanceof HTMLElement) {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }
  });
}

export function PremiumMotion() {
  useEffect(() => {
    document.documentElement.classList.add('motion-ready');
    if (shouldUseLiteMotion()) document.documentElement.classList.add('motion-lite');
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('motion-reduced');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('motion-visible');

            // Activate line reveals inside
            entry.target.querySelectorAll('[data-line-reveal="true"]').forEach(activateReveals);

            // Activate word reveals inside
            if (entry.target.classList.contains('word-reveal-target')) {
              activateWordReveal(entry.target);
            }

            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    const prepare = (root: ParentNode = document) => {
      root.querySelectorAll(REVEAL_SELECTOR).forEach((element, index) => {
        if (!(element instanceof HTMLElement) || element.dataset.motionReveal === 'true') return;
        element.dataset.motionReveal = 'true';

        // Stagger: group-based delay for premium-cascade items, else index-based
        const order = element.classList.contains('premium-stagger')
          ? (element.dataset.staggerIndex ? parseInt(element.dataset.staggerIndex, 10) % 8 : index % 8)
          : Math.min(index % 8, 7);
        element.style.setProperty('--motion-order', String(order));

        observer.observe(element);
      });

      // Prepare line reveals on heading elements
      Array.from(root.querySelectorAll('[data-reveal="line"]')).forEach((el) => {
        if (el instanceof HTMLElement) prepareLineReveal(el);
      });

      // Prepare word reveals
      Array.from(root.querySelectorAll('[data-reveal="words"]')).forEach((el) => {
        if (el instanceof HTMLElement) prepareWordReveal(el);
      });
    };

    prepare();
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) prepare(node);
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
