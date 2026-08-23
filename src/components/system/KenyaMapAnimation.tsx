'use client';

import { useEffect, useRef } from 'react';

/**
 * Kenya outline — stylized simplified polygon path.
 * Coordinates are in a normalized 0-1 space relative to the canvas.
 * The outline is drawn with a thin stroke, no fill.
 */
const KENYA_OUTLINE: [number, number][] = [
  [0.52, 0.00], // northern tip (border with Ethiopia/South Sudan)
  [0.58, 0.03],
  [0.65, 0.05],
  [0.72, 0.08],
  [0.78, 0.12],
  [0.82, 0.18], // northeast (Somalia border)
  [0.85, 0.25],
  [0.87, 0.32],
  [0.88, 0.40],
  [0.87, 0.48],
  [0.85, 0.55],
  [0.82, 0.62],
  [0.78, 0.68],
  [0.73, 0.74],
  [0.68, 0.80],
  [0.62, 0.85], // southeast coast
  [0.55, 0.90],
  [0.48, 0.93],
  [0.42, 0.95], // south (Tanzania border)
  [0.35, 0.93],
  [0.28, 0.90],
  [0.22, 0.85],
  [0.18, 0.80],
  [0.15, 0.73], // southwest
  [0.13, 0.65],
  [0.12, 0.58],
  [0.12, 0.50], // west (Lake Victoria)
  [0.13, 0.42],
  [0.15, 0.35],
  [0.18, 0.28],
  [0.22, 0.22],
  [0.27, 0.16], // northwest
  [0.32, 0.10],
  [0.38, 0.05],
  [0.45, 0.02],
];

/**
 * Major Kenyan cities with approximate normalized coordinates
 * inside the Kenya outline bounding box.
 */
const KENYA_CITIES: { name: string; x: number; y: number }[] = [
  { name: 'Nairobi', x: 0.48, y: 0.62 },
  { name: 'Mombasa', x: 0.78, y: 0.82 },
  { name: 'Kisumu', x: 0.18, y: 0.48 },
  { name: 'Nakuru', x: 0.40, y: 0.52 },
  { name: 'Eldoret', x: 0.30, y: 0.35 },
  { name: 'Thika', x: 0.52, y: 0.56 },
  { name: 'Malindi', x: 0.82, y: 0.70 },
  { name: 'Naivasha', x: 0.38, y: 0.58 },
  { name: 'Nyeri', x: 0.44, y: 0.48 },
  { name: 'Machakos', x: 0.55, y: 0.65 },
  { name: 'Meru', x: 0.55, y: 0.45 },
  { name: 'Kakamega', x: 0.22, y: 0.42 },
  { name: 'Kitale', x: 0.25, y: 0.30 },
  { name: 'Garissa', x: 0.72, y: 0.40 },
  { name: 'Lamu', x: 0.85, y: 0.60 },
];

/** Draw a smooth closed path from polygon points */
function drawKenyaOutline(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  w: number,
  h: number,
  padding: number
) {
  const mapW = w - padding * 2;
  const mapH = h - padding * 2;

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = padding + points[i][0] * mapW;
    const py = padding + points[i][1] * mapH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Draw a pulsing dot with glow */
function drawCityDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  color: string
) {
  // Outer glow
  const glowRadius = radius * 4;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, color.replace(')', `, ${alpha * 0.4})`).replace('rgb', 'rgba'));
  glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner dot
  ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

interface CityDotState {
  phase: number;      // 0-2π
  speed: number;      // radians per frame
  baseRadius: number;
}

export function KenyaMapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    dots: CityDotState[];
    animFrame: number;
    lastTime: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dot states with staggered phases
    const dots: CityDotState[] = KENYA_CITIES.map((_, i) => ({
      phase: (i / KENYA_CITIES.length) * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.01, // ~2.5-4s cycle at 30fps
      baseRadius: 2.5 + Math.random() * 1.5,
    }));

    stateRef.current = { dots, animFrame: 0, lastTime: 0 };

    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    function render(time: number) {
      if (!running || !ctx || !canvas) return;

      const state = stateRef.current!;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Throttle to ~30fps
      if (time - state.lastTime < 33) {
        state.animFrame = requestAnimationFrame(render);
        return;
      }
      state.lastTime = time;

      ctx.clearRect(0, 0, w, h);

      const padding = Math.min(w, h) * 0.08;

      // Draw Kenya outline
      drawKenyaOutline(ctx, KENYA_OUTLINE, w, h, padding);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Second outline pass for subtle glow
      drawKenyaOutline(ctx, KENYA_OUTLINE, w, h, padding);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw pulsing city dots
      const mapW = w - padding * 2;
      const mapH = h - padding * 2;
      const isMobile = w < 600;
      const maxDots = isMobile ? 8 : KENYA_CITIES.length;

      for (let i = 0; i < maxDots; i++) {
        const city = KENYA_CITIES[i];
        const dot = state.dots[i];

        dot.phase += dot.speed;
        if (dot.phase > Math.PI * 2) dot.phase -= Math.PI * 2;

        // Sine wave: 0.3 → 1.0 → 0.3
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(dot.phase));

        const x = padding + city.x * mapW;
        const y = padding + city.y * mapH;

        drawCityDot(ctx, x, y, dot.baseRadius, alpha, 'rgb(16, 185, 129)');
      }

      // Draw connecting lines between nearby cities (very subtle)
      if (!isMobile) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < maxDots; i++) {
          for (let j = i + 1; j < maxDots; j++) {
            const c1 = KENYA_CITIES[i];
            const c2 = KENYA_CITIES[j];
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.2) {
              ctx.beginPath();
              ctx.moveTo(padding + c1.x * mapW, padding + c1.y * mapH);
              ctx.lineTo(padding + c2.x * mapW, padding + c2.y * mapH);
              ctx.stroke();
            }
          }
        }
      }

      state.animFrame = requestAnimationFrame(render);
    }

    stateRef.current!.animFrame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(stateRef.current?.animFrame ?? 0);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  );
}
