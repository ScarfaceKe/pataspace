'use client';

import { useEffect, useRef } from 'react';

/**
 * MorphingBlob — An organic blob shape that continuously morphs
 * and changes form. Liquid-like, premium, hypnotic.
 *
 * Use for: initial site load, first-time visitor experience.
 *
 * Props:
 *   message — optional loading message
 *   size — blob size in px (default 200)
 *   color — blob color (default teal)
 */

interface MorphingBlobProps {
  message?: string;
  size?: number;
  color?: string;
  className?: string;
}

export function MorphingBlob({
  message = 'Preparing PataSpace...',
  size = 200,
  color = '#10b981',
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

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      ctx!.scale(dpr, dpr);
    }

    /**
     * Draw a morphing blob using polar coordinates with noise.
     * The shape is defined by a radius function r(θ) that varies over time.
     */
    function drawBlob(cx: number, cy: number, baseRadius: number, t: number) {
      const points = 128;
      ctx!.beginPath();

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;

        // Multiple sine waves at different frequencies create organic morphing
        const r =
          baseRadius +
          Math.sin(angle * 3 + t * 0.8) * (baseRadius * 0.12) +
          Math.sin(angle * 5 - t * 0.6) * (baseRadius * 0.08) +
          Math.cos(angle * 2 + t * 1.1) * (baseRadius * 0.1) +
          Math.sin(angle * 7 + t * 0.4) * (baseRadius * 0.05);

        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }

      ctx!.closePath();
    }

    function render() {
      if (!running || !ctx || !canvas) return;

      time += 0.012;
      const s = size;
      const cx = s / 2;
      const cy = s / 2;
      const baseRadius = s * 0.3;

      ctx.clearRect(0, 0, s, s);

      // Draw multiple layers for depth
      for (let layer = 3; layer >= 0; layer--) {
        const layerOffset = layer * 0.5;
        const layerAlpha = 0.08 + (3 - layer) * 0.06;
        const layerRadius = baseRadius + layer * (baseRadius * 0.08);

        drawBlob(cx, cy, layerRadius, time + layerOffset);

        // Gradient fill
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerRadius * 1.5);
        gradient.addColorStop(0, `rgba(16, 185, 129, ${layerAlpha + 0.1})`);
        gradient.addColorStop(0.6, `rgba(16, 185, 129, ${layerAlpha})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Inner bright core
      drawBlob(cx, cy, baseRadius * 0.6, time * 1.3);
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.6);
      coreGradient.addColorStop(0, 'rgba(52, 211, 153, 0.3)');
      coreGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Thin stroke on outermost blob
      drawBlob(cx, cy, baseRadius, time);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
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
