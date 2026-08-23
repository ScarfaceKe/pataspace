'use client';

import { useState, useCallback, useEffect } from 'react';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { ScrollProgress } from '@/components/system/ScrollProgress';
import { MorphingBlob } from '@/components/system/MorphingBlob';
import { PremiumMotion } from '@/components/system/PremiumMotion';

export function PremiumLandingShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Show morphing blob for 2.5s then fade out
    const holdTimer = setTimeout(() => setExiting(true), 2500);
    const completeTimer = setTimeout(() => {
      setLoaded(true);
      document.documentElement.classList.remove('lenis-stopped');
    }, 3200);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <>
      <SmoothScroll />
      {!loaded && (
        <div className="morphing-blob-exit" style={{ opacity: exiting ? 0 : 1, transition: 'opacity 0.7s ease', pointerEvents: exiting ? 'none' : 'auto' }}>
          <MorphingBlob message="Preparing PataSpace..." size={240} />
        </div>
      )}
      {loaded && <ScrollProgress />}
      <PremiumMotion />
      <div className={`page-transition-shell${loaded ? ' loaded' : ''}`}>
        {children}
      </div>
    </>
  );
}
