'use client';

import { useEffect } from 'react';

export function SessionRefresh() {
  useEffect(() => {
    let active = true;
    async function refresh() {
      if (!active) return;
      await fetch('/api/auth/session/refresh', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
    }
    refresh();
    const timer = window.setInterval(refresh, 1000 * 60 * 20);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
