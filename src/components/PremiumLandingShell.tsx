'use client';

import { useState, useEffect } from 'react';
import { SmoothScroll } from '@/components/system/SmoothScroll';
import { ScrollProgress } from '@/components/system/ScrollProgress';
import { KenyaMapLoadingScreen } from '@/components/system/KenyaMapLoadingScreen';
import { PremiumMotion } from '@/components/system/PremiumMotion';

export function PremiumLandingShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Remove the immediate SVG loader from layout (it rendered before React)
    const svgLoader = typeof window !== 'undefined' ? document.getElementById('ps-immediate-loader') : null;

    // Show Kenya map loading screen for 2.5s then fade out
    const holdTimer = setTimeout(() => {
      setExiting(true);
      // Fade out the SVG loader simultaneously
      if (svgLoader) {
        svgLoader.style.opacity = '0';
        svgLoader.style.visibility = 'hidden';
      }
    }, 2500);

    const completeTimer = setTimeout(() => {
      setLoaded(true);
      document.documentElement.classList.remove('lenis-stopped');
      // Remove SVG loader from DOM entirely
      if (svgLoader) svgLoader.remove();
    }, 3200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
      if (svgLoader) svgLoader.remove();
    };
  }, []);

  return (
    <>
      <SmoothScroll />
      {!loaded && (
        <div
          style={{
            opacity: exiting ? 0 : 1,
            transition: 'opacity 0.7s ease',
            pointerEvents: exiting ? 'none' : 'auto',
          }}
          aria-hidden="true"
        >
          <KenyaMapLoadingScreen />
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
