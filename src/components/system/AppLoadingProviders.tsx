'use client';

import { useEffect } from 'react';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { LoadingBar } from './LoadingBar';

/**
 * Mounts global loading components once at the app root.
 * Also dismisses the pre-hydration brand splash on every route, so a direct
 * visit to any page is never left behind a loading screen.
 */
export function AppLoadingProviders() {
  useEffect(() => {
    const splash = document.getElementById('ps-immediate-loader');
    if (!splash) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduceMotion ? 120 : 620;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    const hideTimer = setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.visibility = 'hidden';
      removeTimer = setTimeout(() => splash.remove(), 700);
    }, hold);

    return () => {
      clearTimeout(hideTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      <GlobalLoadingOverlay />
      <LoadingBar />
    </>
  );
}
