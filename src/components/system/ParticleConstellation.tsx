'use client';

import { useEffect, useRef } from 'react';
import { useCanvasPerformance } from './useCanvasPerformance';

/**
 * ParticleConstellation — Floating dots that connect with thin lines
 * when they get close to each other, forming temporary constellations.
 *
 * Use for: match search loading, search result processing, intelligent matching.
 *
 * Props:
 *   message — optional loading message to show in center
 *   density — number of particles (default 40, mobile 20)
 *   color — dot/line color (default teal)
 */

interface ParticleConstellationProps {
  message?: string;
  density?: number;
  color?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export function ParticleConstellation({
  message = 'Searching...',
  density,
  color = '16, 185, 129', // teal RGB
  className = '',
}: ParticleConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const perf = useCanvasPerformance();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If user prefers reduced motion, skip animation entirely
    if (perf.reducedMotion) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * perf.dpr;
      canvas.height = rect.height * perf.dpr;
      ctx.scale(perf.dpr, perf.dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);
      // Draw a few static dots
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        ctx.fillStyle = `rgba(${color}, 0.5)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    const isMobile = window.innerWidth < 600;
    const particleCount = density ?? (isMobile ? Math.round(20 * perf.densityMultiplier) : Math.round(40 * perf.densityMultiplier));
    const connectionDistance = isMobile ? 100 : 150;

    let particles: Particle[] = [];
    let running = true;
    let lastTime = 0;
    let animFrame = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * perf.dpr;
      canvas!.height = rect.height * perf.dpr;
      ctx!.scale(perf.dpr, perf.dpr);
      initParticles(rect.width, rect.height);
    }

    function initParticles(w: number, h: number) {
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
      }));
    }

    function render(time: number) {
      if (!running || !ctx || !canvas) return;

      // Throttle to 30fps (20fps on low-end)
      const frameInterval = perf.isLowEnd ? 50 : 33;
      if (time - lastTime < frameInterval) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Update and draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Draw dot with glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        glow.addColorStop(0, `rgba(${color}, ${p.alpha})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright dot
        ctx.fillStyle = `rgba(${color}, ${p.alpha + 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animFrame = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    animFrame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, [density, color]);

  return (
    <div className={`particle-constellation-container ${className}`} role="status" aria-label={message}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div className="particle-constellation-message">
        <div className="constellation-dots">
          <span className="constellation-dot" style={{ animationDelay: '0s' }} />
          <span className="constellation-dot" style={{ animationDelay: '0.3s' }} />
          <span className="constellation-dot" style={{ animationDelay: '0.6s' }} />
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
