'use client';

import { useEffect, useState } from 'react';

const FORM_DRAFT_PREFIX = 'pataspace-form-draft:';
const SKIPPED_TYPES = new Set(['password', 'file', 'hidden']);

function fieldKey(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
  const form = field.form;
  if (!form) return null;
  const formId = form.getAttribute('data-draft-key') || form.id || form.getAttribute('aria-label') || window.location.pathname;
  const name = field.name || field.id;
  return name ? `${FORM_DRAFT_PREFIX}${formId}:${name}` : null;
}

function shouldPersist(field: Element): field is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return false;
  if (field instanceof HTMLInputElement && SKIPPED_TYPES.has(field.type)) return false;
  if (field.hasAttribute('data-no-draft')) return false;
  return Boolean(field.name || field.id);
}

export function OfflineResilience() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const restoreDrafts = () => {
      document.querySelectorAll('input, textarea, select').forEach((element) => {
        if (!shouldPersist(element)) return;
        const key = fieldKey(element);
        if (!key || element.value) return;
        const stored = sessionStorage.getItem(key);
        if (stored !== null) element.value = stored;
      });
    };

    const persistDraft = (event: Event) => {
      const target = event.target;
      if (!shouldPersist(target as Element)) return;
      const field = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const key = fieldKey(field);
      if (key) sessionStorage.setItem(key, field.value);
    };

    const clearDrafts = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      window.setTimeout(() => {
        form.querySelectorAll('input, textarea, select').forEach((element) => {
          if (!shouldPersist(element)) return;
          const key = fieldKey(element);
          if (key) sessionStorage.removeItem(key);
        });
      }, 1200);
    };

    restoreDrafts();
    document.addEventListener('input', persistDraft, true);
    document.addEventListener('change', persistDraft, true);
    document.addEventListener('submit', clearDrafts, true);
    return () => {
      document.removeEventListener('input', persistDraft, true);
      document.removeEventListener('change', persistDraft, true);
      document.removeEventListener('submit', clearDrafts, true);
    };
  }, []);

  return (
    <div className={online ? 'offline-banner' : 'offline-banner visible'} role="status" aria-live="polite">
      You appear to be offline. PataSpace will keep your typed details on this device and reconnect automatically.
    </div>
  );
}
