'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCanvasPerformance } from './useCanvasPerformance';

/**
 * KenyaMapLoadingScreen — Full-screen Kenya map loading experience.
 * - Real geographic Kenya from Natural Earth 10m data
 * - Equirectangular projection (no distortion near equator)
 * - 15 city dots with breathing pulse
 * - Traveling highlight: Nairobi → Nakuru → Eldoret → Kisumu → Mombasa
 * - 3D depth via layered outlines with shadows
 * - Covers ~75% of screen
 */

const KENYA_BOUNDARY: [number, number][] = [
  [35.705846, 4.619447], [36.225726, 4.449600], [37.082522, 4.322166],
  [38.048974, 3.641846], [38.574110, 3.604561], [39.067930, 3.526582],
  [39.600818, 3.528907], [40.365732, 4.094867], [41.215293, 3.936608],
  [41.446183, 3.349047], [40.968486, 1.497145], [40.976961, -0.653861],
  [41.535085, -1.696303], [41.096853, -1.985284], [40.908214, -1.997735],
  [40.906016, -2.153253], [40.883149, -2.224054], [40.758149, -2.447442],
  [40.188650, -2.813572], [40.129080, -3.251886], [39.963390, -3.393243],
  [39.808116, -3.608819], [39.712087, -3.965020], [39.604666, -3.988214],
  [39.551117, -4.402114], [39.397716, -4.570082], [39.020388, -4.554915],
  [37.722276, -3.539990], [37.668429, -3.338245], [35.246367, -1.706823],
  [33.952480, -0.115702], [34.219751, 0.638567], [34.560065, 1.093149],
  [34.913558, 1.561560], [34.904284, 2.254255], [34.740959, 2.835539],
  [34.574664, 2.946126], [34.386872, 3.485628], [34.240938, 3.783620],
  [34.086219, 3.894673], [34.006017, 4.205713], [35.433715, 5.003836],
  [35.705846, 4.619447],
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

const LNG_MIN = 33.952480;
const LNG_MAX = 41.535085;
const LAT_MIN = -4.570082;
const LAT_MAX = 5.003836;
const LNG_RANGE = LNG_MAX - LNG_MIN;
const LAT_RANGE = LAT_MAX - LAT_MIN;

function geoToCanvas(lng: number, lat: number): [number, number] {
  return [
    (lng - LNG_MIN) / LNG_RANGE,
    (LAT_MAX - lat) / LAT_RANGE,
  ];
}

const KENYA_OUTLINE: [number, number][] = KENYA_BOUNDARY.map(([lng, lat]) => geoToCanvas(lng, lat));
const CITY_DOTS: { name: string; x: number; y: number }[] = KENYA_CITIES.map((c) => {
  const [x, y] = geoToCanvas(c.lng, c.lat);
  return { name: c.name, x, y };
});

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
    travelProgress: number;
    routeIndex: number;
  } | null>(null);

  const cleanup = useCallback(() => {
    if (stateRef.current) cancelAnimationFrame(stateRef.current.animFrame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

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

    stateRef.current = { animFrame: 0, lastTime: 0, travelProgress: 0, routeIndex: 0 };

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

      // --- 3D Kenya outline layers ---
      // Shadow
      ctx.save();
      ctx.translate(3, 4);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(0, 40, 30, 0.1)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // Outer glow
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Mid glow
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Main outline
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Bright edge
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Interior fill
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      const fillGrad = ctx.createLinearGradient(pad, pad, pad + mapW, pad + mapH);
      fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.02)');
      fillGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
      fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Pulsing outline
      const pulseA = 0.08 + 0.06 * Math.sin(time * 0.001);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = `rgba(16, 185, 129, ${pulseA})`;
      ctx.lineWidth = 2 + Math.sin(time * 0.0008) * 0.5;
      ctx.stroke();

      // --- Traveling highlight ---
      state.travelProgress += (dt / 1000) * 0.4;
      if (state.travelProgress >= 1) {
        state.travelProgress -= 1;
        state.routeIndex = (state.routeIndex + 1) % TRAVEL_ROUTE.length;
      }

      const fromIdx = getCityIndex(TRAVEL_ROUTE[state.routeIndex]);
      const toIdx = getCityIndex(TRAVEL_ROUTE[(state.routeIndex + 1) % TRAVEL_ROUTE.length]);
      const t = state.travelProgress;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const fromX = pad + CITY_DOTS[fromIdx].x * mapW;
      const fromY = pad + CITY_DOTS[fromIdx].y * mapH;
      const toX = pad + CITY_DOTS[toIdx].x * mapW;
      const toY = pad + CITY_DOTS[toIdx].y * mapH;
      const hlX = fromX + (toX - fromX) * ease;
      const hlY = fromY + (toY - fromY) * ease;

      // Traveling beam
      const beamGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, 50);
      beamGrad.addColorStop(0, 'rgba(110, 231, 183, 0.3)');
      beamGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.12)');
      beamGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.arc(hlX, hlY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Connecting lines
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

      // --- City dots ---
      for (let i = 0; i < maxDots; i++) {
        const city = CITY_DOTS[i];
        const x = pad + city.x * mapW;
        const y = pad + city.y * mapH;

        const dxH = x - hlX;
        const dyH = y - hlY;
        const distH = Math.sqrt(dxH * dxH + dyH * dyH);
        const proximity = Math.max(0, 1 - distH / 80);

        const breathePhase = time * 0.001 + i * 0.7;
        const breathe = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(breathePhase));
        const alpha = Math.min(breathe + proximity * 0.5, 1);
        const baseR = 3 + proximity * 2;

        const ringProgress = 0.5 + 0.5 * Math.sin(time * 0.0008 + i * 1.1);
        const ringR = baseR * 2 + ringProgress * baseR * 4;
        const ringAlpha = ringProgress * 0.5;

        if (ringAlpha > 0.01) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        const glowR = baseR * 5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glow.addColorStop(0, `rgba(16, 185, 129, ${alpha * 0.35})`);
        glow.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.1})`);
        glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(alpha + 0.3, 1)})`;
        ctx.beginPath();
        ctx.arc(x, y, baseR, 0, Math.PI * 2);
        ctx.fill();

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
          width: '75vmin',
          maxWidth: 520,
          height: 'auto',
          aspectRatio: `${LNG_RANGE} / ${LAT_RANGE}`,
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
