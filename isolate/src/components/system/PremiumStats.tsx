'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
}

function StatCounter({ value, suffix = '', label }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !counted.current) {
            counted.current = true;
            // Animate count-up
            const duration = 1200;
            const start = performance.now();
            function tick(now: number) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quart
              const eased = 1 - Math.pow(1 - progress, 4);
              setDisplay(Math.round(eased * value));
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="premium-stat-item">
      <div className="premium-stat-number">{display}{suffix}</div>
      <div className="premium-stat-label">{label}</div>
    </div>
  );
}

const STATS = [
  { value: 47, suffix: '+', label: 'Counties covered' },
  { value: 4, suffix: '', label: 'Property categories' },
  { value: 100, suffix: '%', label: 'Kenya focused' },
  { value: 0, suffix: '', label: 'Fake listings tolerated' },
];

export function PremiumStats() {
  return (
    <section>
      <div className="premium-section">
        <div className="premium-stat-panel">
          <div className="hero-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: '#10b981' }} />
            By the numbers
          </div>
          <div className="premium-heading" style={{ marginTop: '1rem' }}>
            <h2 style={{ color: '#fff', maxWidth: '20ch' }}>Built for every corner of Kenya</h2>
          </div>
          <div className="premium-stat-grid">
            {STATS.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
