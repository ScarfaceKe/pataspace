'use client';

import { useEffect, useState } from 'react';

interface CanvasPerformance {
  /** Whether to skip animations entirely (user prefers reduced motion) */
  reducedMotion: boolean;
  /** Whether to use lighter rendering (low-end device detected) */
  isLowEnd: boolean;
  /** Device pixel ratio capped at 2 for performance */
  dpr: number;
  /** Recommended particle/point count multiplier (0.5 on low-end) */
  densityMultiplier: number;
}

/**
 * Detects device capabilities and accessibility preferences
 * to optimize canvas animation performance.
 */
export function useCanvasPerformance(): CanvasPerformance {
  const [perf, setPerf] = useState<CanvasPerformance>({
    reducedMotion: false,
    isLowEnd: false,
    dpr: 1,
    densityMultiplier: 1,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as any).connection?.saveData === true;
    const lowConcurrency = (navigator.hardwareConcurrency || 4) <= 2;
    const isLowEnd = reducedMotion || saveData || lowConcurrency;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    setPerf({
      reducedMotion,
      isLowEnd,
      dpr,
      densityMultiplier: isLowEnd ? 0.5 : 1,
    });
  }, []);

  return perf;
}
