'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvasPerformance } from './useCanvasPerformance';

/**
 * Kenya boundary from Natural Earth 10m admin-0 countries (Kenya only, 43 vertices).
 * Equirectangular projection: longitude → x, latitude → y (inverted).
 * Geographically accurate — no Mercator distortion near equator.
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

// Equirectangular bounds
const LNG_MIN = 33.952480;
const LNG_MAX = 41.535085;
const LAT_MIN = -4.570082;
const LAT_MAX = 5.003836;
const LNG_RANGE = LNG_MAX - LNG_MIN;
const LAT_RANGE = LAT_MAX - LAT_MIN;

/** Equirectangular projection: lon → x, lat → y (flipped for canvas) */
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

/** Draw the Kenya outline path on canvas */
function drawKenyaPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  w: number,
  h: number,
  pad: number,
) {
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
  if (ringAlpha > 0.01) {
    ctx.strokeStyle = `rgba(16, 185, 129, ${ringAlpha * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  const glowRadius = baseRadius * 5;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  glow.addColorStop(0, `rgba(16, 185, 129, ${alpha * 0.35})`);
  glow.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.1})`);
  glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(alpha + 0.3, 1)})`;
  ctx.beginPath();
  ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
  ctx.fill();

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
  const perf = useCanvasPerformance();
  const [scrollY, setScrollY] = useState(0);
  const stateRef = useRef<{
    dots: DotState[];
    animFrame: number;
    lastTime: number;
  } | null>(null);

  // Track scroll for parallax — maps scrollY to [0, 1] progress
  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY;
          // Normalize: 0 = top of page, 1 = one full viewport scrolled
          const heroH = window.innerHeight || 800;
          const progress = Math.min(sy / heroH, 1);
          setScrollY(progress);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots: DotState[] = CITY_DOTS.map((_, i) => ({
      phase: (i / CITY_DOTS.length) * Math.PI * 2,
      speed: 0.012 + Math.random() * 0.008,
      baseRadius: 3 + Math.random() * 1.5,
      ringPhase: (i / CITY_DOTS.length) * Math.PI * 2,
      ringSpeed: 0.008 + Math.random() * 0.006,
    }));

    stateRef.current = { dots, animFrame: 0, lastTime: 0 };
    let running = true;

    // Reduced motion: draw once statically
    if (perf.reducedMotion) {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const pad = Math.min(w, h) * 0.08;
      canvas.width = w * perf.dpr;
      canvas.height = h * perf.dpr;
      ctx.setTransform(perf.dpr, 0, 0, perf.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      const mapW = w - pad * 2;
      const mapH = h - pad * 2;
      for (const city of CITY_DOTS) {
        const x = pad + city.x * mapW;
        const y = pad + city.y * mapH;
        drawCityDot(ctx, x, y, 3.5, 0.7, 0.3, 12);
      }
      return;
    }

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

      const frameInterval = perf.isLowEnd ? 50 : 33;
      if (time - state.lastTime < frameInterval) {
        state.animFrame = requestAnimationFrame(render);
        return;
      }
      state.lastTime = time;

      ctx.clearRect(0, 0, w, h);

      const pad = Math.min(w, h) * 0.08;
      const mapW = w - pad * 2;
      const mapH = h - pad * 2;

      // Note: scroll parallax is handled by CSS transforms on the canvas element

      // --- 3D DEPTH: Multiple outline layers ---
      // Layer 1: Deepest shadow (dark, offset)
      ctx.save();
      ctx.translate(2, 3);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(0, 40, 30, 0.08)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // Layer 2: Outer glow (wide, faint green)
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Layer 3: Mid glow
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Layer 4: Main outline
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Layer 5: Bright inner edge
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = 'rgba(110, 231, 183, 0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Subtle gradient fill inside Kenya
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      const fillGrad = ctx.createLinearGradient(pad, pad, pad + mapW, pad + mapH);
      fillGrad.addColorStop(0, 'rgba(16, 185, 129, 0.015)');
      fillGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.035)');
      fillGrad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // --- PULSING OUTLINE (alive feel) ---
      const pulseAlpha = 0.08 + 0.06 * Math.sin(time * 0.001);
      drawKenyaPath(ctx, KENYA_OUTLINE, w, h, pad);
      ctx.strokeStyle = `rgba(16, 185, 129, ${pulseAlpha})`;
      ctx.lineWidth = 2 + Math.sin(time * 0.0008) * 0.5;
      ctx.stroke();

      // --- CITY DOTS with parallax offset ---
      const isMobile = w < 600;
      const maxDots = isMobile ? 8 : perf.isLowEnd ? 10 : CITY_DOTS.length;

      for (let i = 0; i < maxDots; i++) {
        const city = CITY_DOTS[i];
        const dot = state.dots[i];

        dot.phase += dot.speed;
        if (dot.phase > Math.PI * 2) dot.phase -= Math.PI * 2;
        dot.ringPhase += dot.ringSpeed;
        if (dot.ringPhase > Math.PI * 2) dot.ringPhase -= Math.PI * 2;

        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(dot.phase));
        const ringProgress = 0.5 + 0.5 * Math.sin(dot.ringPhase);
        const ringRadius = dot.baseRadius * 2 + ringProgress * dot.baseRadius * 4;
        const ringAlpha = ringProgress * 0.5;

        const x = pad + city.x * mapW;
        const y = pad + city.y * mapH;

        drawCityDot(ctx, x, y, dot.baseRadius, alpha, ringAlpha, ringRadius);
      }

      // --- Connecting lines between nearby cities (desktop) ---
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

      state.animFrame = requestAnimationFrame(render);
    }

    stateRef.current!.animFrame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(stateRef.current?.animFrame ?? 0);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // --- SCROLL-DRIVEN 3D PARALLAX ---
  // scrollY is normalized 0→1 (one full viewport of scroll)
  //
  // DOWN scroll: map moves right→left, gets bigger, tilts in 3D
  // UP scroll: map moves left→right, gets smaller, tilt reduces
  // STOPPED: map holds, dots keep beeping
  //
  // Timeline:
  //   0.00  → map at rest: centered-right, normal size, no tilt
  //   0.10  → movement begins
  //   0.50  → map has moved ~halfway left, slightly bigger
  //   0.90  → map near far-left, magnified, strongly tilted
  //   1.00  → map exits scene (opacity → 0)

  const p = scrollY; // 0 to 1

  // Horizontal: center-right (20%) → far-left (-60%)
  const tx = 20 - p * 80; // 20% → -60%

  // Scale: 1.0 → 1.35 (magnifies as it moves left)
  const sc = 1 + p * 0.35;

  // 3D tilt: 0° → 14° (elevated perspective)
  const rotX = p * 14;

  // Opacity: hold at 0.8 until p=0.8, then fade to 0
  const opacity = p > 0.8 ? Math.max(0, 0.8 * (1 - (p - 0.8) / 0.2)) : 0.8;

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
        opacity,
        transform: `perspective(1200px) rotateX(${rotX}deg) translateX(${tx}%) scale(${sc})`,
        transformOrigin: 'center center',
        transition: 'none',
        willChange: 'transform, opacity',
      }}
    />
  );
}
