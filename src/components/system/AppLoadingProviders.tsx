'use client';

import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { LoadingBar } from './LoadingBar';

/**
 * Mounts global loading components once at the app root.
 * These are singletons — any component can call useGlobalLoading() or useLoadingBar()
 * to control them.
 */
export function AppLoadingProviders() {
  return (
    <>
      <GlobalLoadingOverlay />
      <LoadingBar />
    </>
  );
}
