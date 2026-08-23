'use client';

import { useEffect, useRef, useState } from 'react';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const FILL_MS = 1600;

export function PageLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const raw = Math.min(elapsed / FILL_MS, 1);
      const eased = easeInOutCubic(raw);
      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Hold briefly, then exit
        setTimeout(() => setExiting(true), 200);
        setTimeout(() => {
          setHidden(true);
          onComplete();
        }, 900);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      aria-label="Loading PataSpace"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        background: '#0b3f3a',
        color: '#fff',
        transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
        transform: exiting ? 'translateY(-100%)' : 'translateY(0)',
        opacity: exiting ? 0 : 1,
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', transition: 'opacity 0.4s ease, transform 0.4s ease', opacity: exiting ? 0 : 1, transform: exiting ? 'translateY(-12px)' : 'translateY(0)' }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'grid', width: '2.5rem', height: '2.5rem', placeItems: 'center', borderRadius: '0.75rem', background: 'rgba(15, 118, 110, 0.6)', color: '#d9f99d', fontWeight: 900, fontSize: '1.1rem' }}>P</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>PataSpace</span>
        </div>

        <p style={{ maxWidth: '26ch', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.5 }}>
          Smart rental discovery built for Kenya.
        </p>

        {/* Progress block */}
        <div style={{ width: 'min(20rem, 70vw)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Track */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #0f766e)', width: `${progress}%`, transition: 'width 0.1s ease-out' }} />
          </div>
          {/* Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
            <span>Loading</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.75)', minWidth: '2.5em', textAlign: 'right' }}>
              {String(progress).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
