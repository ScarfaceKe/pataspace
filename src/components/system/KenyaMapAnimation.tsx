'use client';

import { useEffect, useRef } from 'react';

/**
 * Real Kenya boundary from Natural Earth / world.geo.json (simplified).
 * Each point is [longitude, latitude].
 * Projected to canvas via Mercator projection for accurate shape.
 */
const KENYA_BOUNDARY: [number, number][] = [
  [40.993, -0.85829],
  [41.58513, -1.68325],
  [40.88477, -2.08255],
  [40.63785, -2.49979],
  [40.26304, -2.57309],
  [40.12119, -3.27768],
  [39.80006, -3.68116],
  [39.60489, -4.34653],
  [39.20222, -4.67677],
  [37.7669, -3.67712],
  [37.69869, -3.09699],
  [34.07262, -1.05982],
  [33.903711, -0.95],
  [33.893569, 0.109814],
  [34.18, 0.515],
  [34.6721, 1.17694],
  [35.03599, 1.90584],
  [34.59607, 3.05374],
  [34.47913, 3.5556],
  [34.005, 4.249885],
  [34.620196, 4.847123],
  [35.298007, 5.506],
  [35.817448, 5.338232],
  [35.817448, 4.776966],
  [36.159079, 4.447864],
  [36.855093, 4.447864],
  [38.120915, 3.598605],
  [38.43697, 3.58851],
  [38.67114, 3.61607],
  [38.89251, 3.50074],
  [39.559384, 3.42206],
  [39.85494, 3.83879],
  [40.76848, 4.25702],
  [41.1718, 3.91909],
  [41.855083, 3.918912],
  [40.98105, 2.78452],
  [40.993, -0.85829],
];

/**
 * Major Kenyan cities with REAL latitude/longitude coordinates.
 */
const KENYA_CITIES: { name: string; lng: number; lat: number }[] = [
  { name: 'Nairobi',   lng: 36.8219, lat: -1.2921 },
  { name: 'Mombasa',   lng: 39.6682, lat: -4.0435 },
  { name: 'Kisumu',    lng: 34.7680, lat: -0.1022 },
  { name: 'Nakuru',    lng: 36.0660, lat: -0.3031 },
  { name: 'Eldoret',   lng: 35.2698, lat:  0.5143 },
  { name: 'Thika',     lng: 37.0692, lat: -1.0388 },
  { name: 'Malindi',   lng: 40.0318, lat: -3.2192 },
  { name: 'Naivasha',  lng: 36.4310, lat: -0.7167 },
  { name: 'Nyeri',     lng: 36.9517, lat: -0.4201 },
  { name: 'Machakos',  lng: 37.2634, lat: -1.5177 },
  { name: 'Meru',      lng: 37.6461, lat:  0.0467 },
  { name: 'Kakamega',  lng: 34.7530, lat:  0.2827 },
  { name: 'Kitale',    lng: 35.0043, lat:  1.0187 },
  { name: 'Garissa',   lng: 39.6353, lat: -0.4532 },
  { name: 'Lamu',      lng: 40.9024, lat: -2.2717 },
];

// Kenya bounding box
const KENYA_MIN_LNG = 33.893569;
const KENYA_MAX_LNG = 41.855083;
const KENYA_MIN_LAT = -4.67677;
const KENYA_MAX_LAT = 5.506;

/** Mercator Y projection */
function mercatorY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const MERC_Y_MIN = mercatorY(KENYA_MIN_LAT); // ~-0.0816
const MERC_Y_MAX = mercatorY(KENYA_MAX_LAT); // ~0.0997
const MERC_Y_RANGE = MERC_Y_MAX - MERC_Y_MIN;

/**
 * Convert real [lng, lat] → canvas [x, y] coordinates in 0-1 normalized space.
 * Uses Mercator projection for y-axis to preserve shape.
 */
function geoToCanvas(lng: number, lat: number): [number, number] {
  const x = (lng - KENYA_MIN_LNG) / (KENYA_MAX_LNG - KENYA_MIN_LNG);
  const mercY = mercatorY(lat);
  // Canvas y is inverted (0=top=north), so flip
  const y = 1 - (mercY - MERC_Y_MIN) / MERC_Y_RANGE;
  return [x, y];
}

// Pre-compute canvas coordinates
const KENYA_OUTLINE: [number, number][] = KENYA_BOUNDARY.map(([lng, lat]) => geoToCanvas(lng, lat));
const KENYA_CITY_DOTS: { name: string; x: number; y: number }[] = KENYA_CITIES.map((c) => ({
  name: c.name,
  ...(() => { const [x, y] = geoToCanvas(c.lng, c.lat); return { x, y }; })(),
}));

/** Draw the Kenya outline path on canvas */
function drawKenyaPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  w: number,
  h: number,
  padding: number,
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

/** Draw a pulsing city dot with glow and expanding ring */
function drawCityDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseRadius: number,
  alpha: number,
  ringAlpha: number,
  ringRadius: number,
) {
  // Expanding ring (breathing pulse)
  if (ringAlpha > 0.01) {
    ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer glow
  const glowRadius = baseRadius * 5;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `rgba(16, 185, 129, ${alpha * 0.35})`);
  glow.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.1})`);
  glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Inner solid dot
  ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(alpha + 0.3, 1)})`;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bright core
  ctx.fillStyle = `rgba(200, 255, 230, ${alpha * 0.8})`;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

interface DotState {
  phase: number;
  speed: number;
  baseRadius: number;
  ringPhase: number;
  ringSpeed: number;
}

export function KenyaMapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    dots: DotState[];
    animFrame: number;
    lastTime: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dot states with staggered phases for organic feel
    const dots: DotState[] = KENYA_CITY_DOTS.map((_, i) => ({
      phase: (i / KENYA_CITY_DOTS.length) * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.008, // 4-6s breathing cycle
      baseRadius: 3 + Math.random() * 1.5,
      ringPhase: (i / KENYA_CITY_DOTS.length) * Math.PI * 2,
      ringSpeed: 0.008 + Math.random() * 0.006, // slower ring expansion
    }));

    stateRef.current = { dots, animFrame: 0, lastTime: 0 };
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
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

      const padding = Math.min(w, h) * 0.06;
      const mapW = w - padding * 2;
      const mapH = h - padding * 2;

      // --- Draw Kenya outline ---

      // Glow layer (thick, faint)
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, padding);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Main outline
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, padding);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner glow outline
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, padding);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Subtle fill inside the country
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, padding);
      const fillGrad = ctx.createLinearGradient(padding, padding, padding + mapW, padding + mapH);
      fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.02)');
      fillGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // --- Draw pulsing city dots ---
      const isMobile = w < 600;
      const maxDots = isMobile ? 8 : KENYA_CITY_DOTS.length;

      for (let i = 0; i < maxDots; i++) {
        const city = KENYA_CITY_DOTS[i];
        const dot = state.dots[i];

        // Update phases
        dot.phase += dot.speed;
        if (dot.phase > Math.PI * 2) dot.phase -= Math.PI * 2;
        dot.ringPhase += dot.ringSpeed;
        if (dot.ringPhase > Math.PI * 2) dot.ringPhase -= Math.PI * 2;

        // Sine wave for breathing alpha: oscillates 0.35 → 1.0 → 0.35
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(dot.phase));

        // Ring expands and fades
        const ringProgress = (0.5 + 0.5 * Math.sin(dot.ringPhase)); // 0 → 1
        const ringRadius = dot.baseRadius * 2 + ringProgress * dot.baseRadius * 4;
        const ringAlpha = ringProgress * 0.5;

        const x = padding + city.x * mapW;
        const y = padding + city.y * mapH;

        drawCityDot(ctx, x, y, dot.baseRadius, alpha, ringAlpha, ringRadius);
      }

      // --- Draw connecting lines between nearby cities (desktop only) ---
      if (!isMobile) {
        for (let i = 0; i < maxDots; i++) {
          for (let j = i + 1; j < maxDots; j++) {
            const c1 = KENYA_CITY_DOTS[i];
            const c2 = KENYA_CITY_DOTS[j];
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.18) {
              const lineAlpha = 0.04 * (1 - dist / 0.18);
              ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
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
        opacity: 0.75,
      }}
    />
  );
}
