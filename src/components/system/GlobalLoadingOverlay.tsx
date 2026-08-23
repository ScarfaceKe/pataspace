'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * GlobalLoadingOverlay — Full-screen branded loading overlay.
 * Use for: form submissions, payment processing, property registration, unlock purchases.
 *
 * Usage:
 *   const { show, hide } = useGlobalLoading();
 *   show({ message: 'Submitting your property...' });
 *   // ... after process completes
 *   hide();
 */

interface LoadingState {
  visible: boolean;
  message: string;
  submessage: string;
  progress: number | null; // null = indeterminate
}

let globalSetState: ((state: Partial<LoadingState>) => void) | null = null;

export function useGlobalLoading() {
  return {
    show: (opts?: { message?: string; submessage?: string; progress?: number | null }) => {
      globalSetState?.({
        visible: true,
        message: opts?.message ?? 'Loading...',
        submessage: opts?.submessage ?? '',
        progress: opts?.progress ?? null,
      });
    },
    update: (opts: { message?: string; submessage?: string; progress?: number | null }) => {
      globalSetState?.({ ...opts });
    },
    hide: () => {
      globalSetState?.({ visible: false });
    },
  };
}

export function GlobalLoadingOverlay() {
  const [state, setState] = useState<LoadingState>({
    visible: false,
    message: 'Loading...',
    submessage: '',
    progress: null,
  });
  const [pulse, setPulse] = useState(0);
  const pulseRef = useRef(0);

  // Register global setter
  useEffect(() => {
    globalSetState = (partial) => setState((prev) => ({ ...prev, ...partial }));
    return () => { globalSetState = null; };
  }, []);

  // Indeterminate pulse animation
  useEffect(() => {
    if (!state.visible) return;
    let raf = 0;
    function tick() {
      pulseRef.current += 0.02;
      setPulse(Math.sin(pulseRef.current) * 0.5 + 0.5);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.visible]);

  if (!state.visible) return null;

  return (
    <div
      className="global-loading-overlay"
      role="alert"
      aria-live="assertive"
      aria-label="Loading"
    >
      <div className="global-loading-content">
        {/* Animated brand mark */}
        <div className="global-loading-brand">
          <div className="global-loading-logo" style={{ transform: `scale(${0.95 + pulse * 0.1})` }}>
            <span>P</span>
          </div>
          <div className="global-loading-dots">
            <span className="global-loading-dot" style={{ animationDelay: '0s' }} />
            <span className="global-loading-dot" style={{ animationDelay: '0.2s' }} />
            <span className="global-loading-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Message */}
        <p className="global-loading-message">{state.message}</p>
        {state.submessage ? (
          <p className="global-loading-submessage">{state.submessage}</p>
        ) : null}

        {/* Progress bar (if determinate) */}
        {state.progress !== null ? (
          <div className="global-loading-progress-track">
            <div
              className="global-loading-progress-fill"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        ) : (
          /* Indeterminate shimmer */
          <div className="global-loading-shimmer" />
        )}
      </div>
    </div>
  );
}
