'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCanvasPerformance } from './useCanvasPerformance';

/**
 * KenyaMapLoadingScreen — Full-screen Kenya map that replaces the immediate SVG loader.
 * Features:
 *   - Real Kenya outline from GeoJSON
 *   - 15 city dots with breathing pulse animation
 *   - Traveling highlight that cycles: Nairobi → Nakuru → Eldoret → Kisumu → Mombasa → Nairobi
 *   - Smooth fade transition when app is ready
 *   - 30fps throttled, reduced-motion safe
 */

const KENYA_BOUNDARY: [number, number][] = [
  [40.993, -0.85829], [41.58513, -1.68325], [40.88477, -2.08255], [40.63785, -2.49979],
  [40.26304, -2.57309], [40.12119, -3.27768], [39.80006, -3.68116], [39.60489, -4.34653],
  [39.20222, -4.67677], [37.7669, -3.67712], [37.69869, -3.09699], [34.07262, -1.05982],
  [33.903711, -0.95], [33.893569, 0.109814], [34.18, 0.515], [34.6721, 1.17694],
  [35.03599, 1.90584], [34.59607, 3.05374], [34.47913, 3.5556], [34.005, 4.249885],
  [34.620196, 4.847123], [35.298007, 5.506], [35.817448, 5.338232], [35.817448, 4.776966],
  [36.159079, 4.447864], [36.855093, 4.447864], [38.120915, 3.598605], [38.43697, 3.58851],
  [38.67114, 3.61607], [38.89251, 3.50074], [39.559384, 3.42206], [39.85494, 3.83879],
  [40.76848, 4.25702], [41.1718, 3.91909], [41.855083, 3.918912], [40.98105, 2.78452],
  [40.993, -0.85829],
];

const KENYA_CITIES: { name: string; lng: number; lat: number }[] = [
  { name: 'Nairobi', lng: 36.8219, lat: -1.2921 },
  { name: 'Mombasa', lng: 39.6682, lat: -4.0435 },
  { name: 'Kisumu', lng: 34.7680, lat: -0.1022 },
  { name: 'Nakuru', lng: 36.0660, lat: -0.3031 },
  { name: 'Eldoret', lng: 35.2698, lat: 0.5143 },
  { name: 'Thika', lng: 37.0692, lat: -1.0388 },
  { name: 'Malindi', lng: 40.0318, lat: -3.2192 },
  { name: 'Naivasha', lng: 36.4310, lat: -0.7167 },
  { name: 'Nyeri', lng: 36.9517, lat: -0.4201 },
  { name: 'Machakos', lng: 37.2634, lat: -1.5177 },
  { name: 'Meru', lng: 37.6461, lat: 0.0467 },
  { name: 'Kakamega', lng: 34.7530, lat: 0.2827 },
  { name: 'Kitale', lng: 35.0043, lat: 1.0187 },
  { name: 'Garissa', lng: 39.6353, lat: -0.4532 },
  { name: 'Lamu', lng: 40.9024, lat: -2.2717 },
];

const KENYA_MIN_LNG = 33.893569;
const KENYA_MAX_LNG = 41.855083;
const KENYA_MIN_LAT = -4.67677;
const KENYA_MAX_LAT = 5.506;

function mercatorY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const MERC_Y_MIN = mercatorY(KENYA_MIN_LAT);
const MERC_Y_MAX = mercatorY(KENYA_MAX_LAT);
const MERC_Y_RANGE = MERC_Y_MAX - MERC_Y_MIN;

function geoToCanvas(lng: number, lat: number): [number, number] {
  const x = (lng - KENYA_MIN_LNG) / (KENYA_MAX_LNG - KENYA_MIN_LNG);
  const mercY = mercatorY(lat);
  const y = 1 - (mercY - MERC_Y_MIN) / MERC_Y_RANGE;
  return [x, y];
}

const KENYA_OUTLINE: [number, number][] = KENYA_BOUNDARY.map(([lng, lat]) => geoToCanvas(lng, lat));
const CITY_DOTS: { name: string; x: number; y: number }[] = KENYA_CITIES.map((c) => {
  const [x, y] = geoToCanvas(c.lng, c.lat);
  return { name: c.name, x, y };
});

/** Cities that form the traveling highlight route */
const TRAVEL_ROUTE = ['Nairobi', 'Nakuru', 'Eldoret', 'Kisumu', 'Mombasa'];

function getCityIndex(name: string): number {
  return CITY_DOTS.findIndex((c) => c.name === name);
}

function drawKenyaPath(ctx: CanvasRenderingContext2D, points: [number, number][], w: number, h: number, pad: number) {
  const mapW = w - pad * 2;
  const mapH = h - pad * 2;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const px = pad + points[i][0] * mapW;
    const py = pad + points[i][1] * mapH;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function KenyaMapLoadingScreen({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const perf = useCanvasPerformance();
  const stateRef = useRef<{
    animFrame: number;
    lastTime: number;
    travelPhase: number; // 0 → total travel route length
    travelProgress: number; // smooth interpolation 0-1 between cities
    routeIndex: number;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (stateRef.current) {
      cancelAnimationFrame(stateRef.current.animFrame);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    // If user prefers reduced motion, draw once statically
    if (perf.reducedMotion) {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const pad = Math.min(w, h) * 0.06;
      canvas.width = w * perf.dpr;
      canvas.height = h * perf.dpr;
      ctx.setTransform(perf.dpr, 0, 0, perf.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      const mapW = w - pad * 2;
      const mapH = h - pad * 2;
      for (const city of CITY_DOTS) {
        const x = pad + city.x * mapW;
        const y = pad + city.y * mapH;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    stateRef.current = {
      animFrame: 0,
      lastTime: 0,
      travelPhase: 0,
      travelProgress: 0,
      routeIndex: 0,
    };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * perf.dpr;
      canvas!.height = rect.height * perf.dpr;
      ctx!.setTransform(perf.dpr, 0, 0, perf.dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    function render(time: number) {
      if (!running || !ctx || !canvas) return;
      const state = stateRef.current!;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // 30fps throttle (20fps low-end)
      const interval = perf.isLowEnd ? 50 : 33;
      if (time - state.lastTime < interval) {
        state.animFrame = requestAnimationFrame(render);
        return;
      }
      const dt = Math.min(time - state.lastTime, 100);
      state.lastTime = time;

      ctx.clearRect(0, 0, w, h);

      const pad = Math.min(w, h) * 0.06;
      const mapW = w - pad * 2;
      const mapH = h - pad * 2;
      const isMobile = w < 600;
      const maxDots = isMobile ? 8 : perf.isLowEnd ? 10 : CITY_DOTS.length;

      // --- Kenya outline glow ---
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 6;
      ctx.stroke();

      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Subtle interior fill
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      const fillGrad = ctx.createLinearGradient(pad, pad, pad + mapW, pad + mapH);
      fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.02)');
      fillGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // --- Update traveling highlight ---
      // Advance at ~0.4 cities per second
      state.travelProgress += (dt / 1000) * 0.4;
      if (state.travelProgress >= 1) {
        state.travelProgress -= 1;
        state.routeIndex = (state.routeIndex + 1) % TRAVEL_ROUTE.length;
      }

      const fromCity = TRAVEL_ROUTE[state.routeIndex];
      const toCity = TRAVEL_ROUTE[(state.routeIndex + 1) % TRAVEL_ROUTE.length];
      const fromIdx = getCityIndex(fromCity);
      const toIdx = getCityIndex(toCity);

      // Smooth ease-in-out interpolation
      const t = state.travelProgress;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const fromX = pad + CITY_DOTS[fromIdx].x * mapW;
      const fromY = pad + CITY_DOTS[fromIdx].y * mapH;
      const toX = pad + CITY_DOTS[toIdx].x * mapW;
      const toY = pad + CITY_DOTS[toIdx].y * mapH;
      const highlightX = fromX + (toX - fromX) * ease;
      const highlightY = fromY + (toY - fromY) * ease;

      // --- Draw connecting lines between nearby cities (desktop only) ---
      if (!isMobile) {
        for (let i = 0; i < maxDots; i++) {
          for (let j = i + 1; j < maxDots; j++) {
            const c1 = CITY_DOTS[i];
            const c2 = CITY_DOTS[j];
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.18) {
              const lineAlpha = 0.04 * (1 - dist / 0.18);
              ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(pad + c1.x * mapW, pad + c1.y * mapH);
              ctx.lineTo(pad + c2.x * mapW, pad + c2.y * mapH);
              ctx.stroke();
            }
          }
        }
      }

      // --- Draw traveling highlight beam ---
      // A soft glow that moves between cities
      const beamGrad = ctx.createRadialGradient(highlightX, highlightY, 0, highlightX, highlightY, 40);
      beamGrad.addColorStop(0, 'rgba(110, 231, 183, 0.25)');
      beamGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.10)');
      beamGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(highlightX, highlightY, 40, 0, Math.PI * 2);
      ctx.fill();

      // --- Draw all city dots ---
      for (let i = 0; i < maxDots; i++) {
        const city = CITY_DOTS[i];
        const x = pad + city.x * mapW;
        const y = pad + city.y * mapH;

        // Distance from traveling highlight determines extra brightness
        const dxH = x - highlightX;
        const dyH = y - highlightY;
        const distH = Math.sqrt(dxH * dxH + dyH * dyH);
        const proximity = Math.max(0, 1 - distH / 80); // 0 at far, 1 at center

        // Base breathing pulse
        const breathePhase = time * 0.001 + i * 0.7;
        const breathe = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(breathePhase));

        // Combine base with proximity boost
        const alpha = Math.min(breathe + proximity * 0.5, 1);
        const baseR = 3 + proximity * 2;

        // Ring pulse
        const ringProgress = 0.5 + 0.5 * Math.sin(time * 0.0008 + i * 1.1);
        const ringR = baseR * 2 + ringProgress * baseR * 4;
        const ringAlpha = ringProgress * 0.5;

        // Expanding ring
        if (ringAlpha > 0.01) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Outer glow
        const glowR = baseR * 5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glow.addColorStop(0, `rgba(16, 185, 129, ${alpha * 0.35})`);
        glow.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.1})`);
        glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid dot
        ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(alpha + 0.3, 1)})`;
        ctx.beginPath();
        ctx.arc(x, y, baseR, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(200, 255, 230, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, baseR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      state.animFrame = requestAnimationFrame(render);
    }

    stateRef.current.animFrame = requestAnimationFrame(render);

    return () => {
      running = false;
      cleanup();
      window.removeEventListener('resize', resize);
    };
  }, [cleanup, perf.reducedMotion, perf.dpr, perf.isLowEnd]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a1a17',
        transition: 'opacity 0.8s ease',
        pointerEvents: onReady ? 'none' : 'auto',
      }}
      role="status"
      aria-label="Loading PataSpace — Connecting Kenya"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          width: '70vmin',
          maxWidth: 420,
          height: 'auto',
          aspectRatio: '1 / 1.15',
        }}
      />
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{
          color: 'rgba(16, 185, 129, 0.7)',
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          PataSpace
        </p>
        <p style={{
          color: 'rgba(16, 185, 129, 0.35)',
          fontSize: '0.72rem',
          marginTop: 8,
        }}>
          Connecting Kenya...
        </p>
      </div>
    </div>
  );
}
