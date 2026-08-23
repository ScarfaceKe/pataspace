'use client';

import { useEffect, useRef } from 'react';

/**
 * MorphingBlob — A smooth organic blob shape that continuously morphs.
 * Uses cubic Bezier curves between polar-coordinate control points
 * for true smoothness (no polygon edges or "scratches").
 *
 * Props:
 *   message — optional loading message
 *   size — blob size in px (default 200)
 */

interface MorphingBlobProps {
  message?: string;
  size?: number;
  className?: string;
}

/**
 * Attempt a cubic Bezier through a set of polar points.
 * Uses Catmull-Rom → Bezier conversion for natural smooth curves.
 */
function catmullRomToBezier(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
) {
  const n = points.length;
  if (n < 3) return;

  ctx.beginPath();

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Catmull-Rom to cubic Bezier control points
    const tension = 6; // higher = tighter curves, less wobble
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    if (i === 0) {
      ctx.moveTo(p1.x, p1.y);
    }
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  ctx.closePath();
}

/**
 * Compute the blob radius at a given angle using layered sine waves.
 * Multiple frequencies create organic, living movement.
 */
function blobRadius(angle: number, t: number, base: number): number {
  return (
    base +
    Math.sin(angle * 2 + t * 0.7) * (base * 0.14) +
    Math.sin(angle * 3 - t * 0.5) * (base * 0.10) +
    Math.cos(angle * 4 + t * 0.9) * (base * 0.07) +
    Math.sin(angle * 5 - t * 0.3) * (base * 0.05) +
    Math.cos(angle * 6 + t * 0.6) * (base * 0.03)
  );
}

/**
 * Generate smooth blob points at a given time.
 */
function generateBlobPoints(
  cx: number,
  cy: number,
  baseRadius: number,
  t: number,
  numPoints: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const r = blobRadius(angle, t, baseRadius);
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return pts;
}

export function MorphingBlob({
  message = 'Preparing PataSpace...',
  size = 200,
  className = '',
}: MorphingBlobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let animFrame = 0;
    let time = 0;
    let lastFrame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(timestamp: number) {
      if (!running || !ctx || !canvas) return;

      // Throttle to ~30fps for smoothness without jank
      if (timestamp - lastFrame < 33) {
        animFrame = requestAnimationFrame(render);
        return;
      }
      lastFrame = timestamp;

      time += 0.014; // smooth, slow morph speed
      const s = size;
      const cx = s / 2;
      const cy = s / 2;
      const baseRadius = s * 0.3;
      const numPoints = 48; // enough for smooth curves, not too many

      ctx.clearRect(0, 0, s, s);

      // --- Layer 1: Outer glow (largest, most transparent) ---
      const outerPts = generateBlobPoints(cx, cy, baseRadius * 1.25, time - 0.8, numPoints);
      catmullRomToBezier(ctx, outerPts);
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.6);
      outerGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      outerGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
      outerGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // --- Layer 2: Middle body ---
      const midPts = generateBlobPoints(cx, cy, baseRadius * 1.05, time - 0.3, numPoints);
      catmullRomToBezier(ctx, midPts);
      const midGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.3);
      midGrad.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
      midGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.10)');
      midGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      ctx.fillStyle = midGrad;
      ctx.fill();

      // --- Layer 3: Inner body (brightest) ---
      const innerPts = generateBlobPoints(cx, cy, baseRadius * 0.85, time, numPoints);
      catmullRomToBezier(ctx, innerPts);
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
      innerGrad.addColorStop(0, 'rgba(52, 211, 153, 0.30)');
      innerGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.18)');
      innerGrad.addColorStop(1, 'rgba(16, 185, 129, 0.03)');
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // --- Layer 4: Bright core (smallest, fastest morph) ---
      const corePts = generateBlobPoints(cx, cy, baseRadius * 0.45, time * 1.4, numPoints);
      catmullRomToBezier(ctx, corePts);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.5);
      coreGrad.addColorStop(0, 'rgba(110, 231, 183, 0.25)');
      coreGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // --- Thin glowing stroke on main body ---
      catmullRomToBezier(ctx, innerPts);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animFrame = requestAnimationFrame(render);
    }

    resize();
    animFrame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animFrame);
    };
  }, [size]);

  return (
    <div className={`morphing-blob-container ${className}`} role="status" aria-label={message}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: size, height: size }}
        className="morphing-blob-canvas"
      />
      <div className="morphing-blob-message">
        <p>{message}</p>
      </div>
    </div>
  );
}
