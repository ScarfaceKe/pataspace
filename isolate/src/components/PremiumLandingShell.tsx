'use client';

import { useState, useCallback } from 'react';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { ScrollProgress } from '@/components/system/ScrollProgress';
import { PageLoader } from '@/components/system/PageLoader';
import { PremiumMotion } from '@/components/system/PremiumMotion';

export function PremiumLandingShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  const handleLoaderComplete = useCallback(() => {
    setLoaded(true);
    document.documentElement.classList.remove('lenis-stopped');
  }, []);

  return (
    <>
      <SmoothScroll />
      <PageLoader onComplete={handleLoaderComplete} />
      {loaded && <ScrollProgress />}
      <PremiumMotion />
      <div className={`page-transition-shell${loaded ? ' loaded' : ''}`}>
        {children}
      </div>
    </>
  );
}
