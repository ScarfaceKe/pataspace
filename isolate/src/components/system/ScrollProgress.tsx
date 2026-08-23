'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress * 100}%`,
        height: '3px',
        background: 'linear-gradient(90deg, #10b981, #0f766e, #115e59)',
        zIndex: 9998,
        transition: 'width 0.15s ease-out',
        willChange: 'width',
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px rgba(15, 118, 110, 0.3)',
      }}
    />
  );
}
