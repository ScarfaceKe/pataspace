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
  cyclingMessages?: string[]; // typewriter cycling messages
}

let globalSetState: ((state: Partial<LoadingState>) => void) | null = null;

export function useGlobalLoading() {
  return {
    show: (opts?: { message?: string; submessage?: string; progress?: number | null; cyclingMessages?: string[] }) => {
      globalSetState?.({
        visible: true,
        message: opts?.message ?? 'Loading...',
        submessage: opts?.submessage ?? '',
        progress: opts?.progress ?? null,
        cyclingMessages: opts?.cyclingMessages,
      });
    },
    update: (opts: { message?: string; submessage?: string; progress?: number | null; cyclingMessages?: string[] }) => {
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

  const [displayMessage, setDisplayMessage] = useState('');
  const [typewriterText, setTypewriterText] = useState('');
  const messageIndexRef = useRef(0);
  const charIndexRef = useRef(0);

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

  // Typewriter cycling messages
  useEffect(() => {
    if (!state.visible) {
      setDisplayMessage(state.message);
      setTypewriterText('');
      messageIndexRef.current = 0;
      charIndexRef.current = 0;
      return;
    }

    const messages = state.cyclingMessages;
    if (!messages || messages.length === 0) {
      setDisplayMessage(state.message);
      setTypewriterText('');
      return;
    }

    let typingInterval: ReturnType<typeof setInterval> | null = null;
    let switchTimeout: ReturnType<typeof setTimeout> | null = null;

    function startTyping() {
      if (!messages || messages.length === 0) return;
      const msg = messages[messageIndexRef.current % messages.length];
      charIndexRef.current = 0;
      setTypewriterText('');

      typingInterval = setInterval(() => {
        charIndexRef.current++;
        setTypewriterText(msg.slice(0, charIndexRef.current));
        if (charIndexRef.current >= msg.length) {
          if (typingInterval) clearInterval(typingInterval);
          // Hold for 2s then switch to next message
          switchTimeout = setTimeout(() => {
            messageIndexRef.current++;
            startTyping();
          }, 2000);
        }
      }, 40); // 40ms per character = typewriter speed
    }

    startTyping();

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      if (switchTimeout) clearTimeout(switchTimeout);
    };
  }, [state.visible, state.message, state.cyclingMessages]);

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

        {/* Message with typewriter effect */}
        <p className="global-loading-message">
          {state.cyclingMessages && state.cyclingMessages.length > 0 ? (
            <>{typewriterText}<span className="typewriter-cursor" /></>
          ) : (
            state.message
          )}
        </p>
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
