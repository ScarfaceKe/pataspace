'use client';

import { useEffect } from 'react';

export function SmoothScroll() {
  useEffect(() => {
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let rafId = 0;

    import('lenis').then(({ default: Lenis }) => {
      window.scrollTo(0, 0);
      lenis = new Lenis({ smoothWheel: true });

      function raf(time: number) {
        lenis!.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
