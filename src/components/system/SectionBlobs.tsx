'use client';

import { useEffect, useRef } from 'react';

/**
 * Renders 2-3 soft floating blobs that drift slowly through section backgrounds.
 * Each blob is a large blurred circle with subtle animation.
 * Respects prefers-reduced-motion.
 */
export function SectionBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    // Create floating blobs
    const blobConfigs = [
      { x: '15%', y: '20%', size: 400, color: 'rgba(16, 185, 129, 0.04)', duration: 25, delay: 0 },
      { x: '80%', y: '45%', size: 350, color: 'rgba(15, 118, 110, 0.05)', duration: 30, delay: 5 },
      { x: '50%', y: '70%', size: 300, color: 'rgba(16, 185, 129, 0.03)', duration: 22, delay: 10 },
      { x: '25%', y: '85%', size: 380, color: 'rgba(15, 118, 110, 0.04)', duration: 28, delay: 3 },
      { x: '70%', y: '15%', size: 320, color: 'rgba(240, 250, 247, 0.6)', duration: 20, delay: 8 },
    ];

    blobConfigs.forEach((cfg) => {
      const blob = document.createElement('div');
      blob.style.cssText = `
        position: absolute;
        left: ${cfg.x};
        top: ${cfg.y};
        width: ${cfg.size}px;
        height: ${cfg.size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${cfg.color}, transparent 70%);
        pointer-events: none;
        will-change: transform;
        animation: sectionBlobFloat ${cfg.duration}s ease-in-out ${cfg.delay}s infinite alternate;
        z-index: 0;
      `;
      container.appendChild(blob);
    });

    return () => {
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, []);

  return <div ref={containerRef} className="section-blobs-container" aria-hidden="true" />;
}

/**
 * Scroll-reactive section wrapper that fades sections in with a subtle scale+opacity
 * as they enter the viewport. Uses IntersectionObserver for performance.
 */
export function ScrollReactiveSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('scroll-reactive-visible');
          } else {
            el.classList.remove('scroll-reactive-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reactive-section ${className}`}>
      {children}
    </div>
  );
}
