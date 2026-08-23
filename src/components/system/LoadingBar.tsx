'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * LoadingBar — Thin animated progress bar at the top of the screen.
 * Shows during route transitions and data fetching.
 *
 * Usage:
 *   const { start, complete } = useLoadingBar();
 *   start();
 *   // ... navigate or fetch
 *   complete();
 *
 * Or mount <LoadingBar /> once in the layout and control via the hook.
 */

let globalBarStart: (() => void) | null = null;
let globalBarComplete: (() => void) | null = null;

export function useLoadingBar() {
  return {
    start: () => globalBarStart?.(),
    complete: () => globalBarComplete?.(),
  };
}

export function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    globalBarStart = () => {
      setActive(true);
      setProgress(0);
      // Simulate progress that slows down as it approaches 90%
      if (intervalRef.current) clearInterval(intervalRef.current);
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += Math.random() * 15;
        if (current > 90) current = 90 + (current - 90) * 0.5;
        setProgress(Math.min(current, 90));
      }, 200);
    };

    globalBarComplete = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 400);
    };

    return () => {
      globalBarStart = null;
      globalBarComplete = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!active && progress === 0) return null;

  return (
    <div
      className="loading-bar"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
      style={{ opacity: active ? 1 : 0 }}
    >
      <div
        className="loading-bar-fill"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 0.3s ease-out' : 'width 0.2s ease-out',
        }}
      />
    </div>
  );
}
