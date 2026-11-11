'use client';

import { useEffect, useRef } from 'react';

const FILM_SRC = '/api/hero-film?v=2';
const POSTER_SRC = '/hero/pataspace-city-poster.jpg';

/** The hero plays the supplied film from its first frame to its last. */
const FILM_START = 0;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

/**
 * The supplied founder film is the hero artwork. It is silent, never
 * autoplays, and is scrubbed by the same scroll position that drives the
 * rest of the hero. Reversing the scroll rewinds it frame-for-frame.
 */
export function HeroFilm() {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!host || !video) return;

    const context = canvas?.getContext('2d') ?? null;
    let paintRaf = 0;

    const section = host.closest('.ps-cinema') as HTMLElement | null;
    const pin = host.closest('.ps-cinema__pin') as HTMLElement | null;
    if (!section || !pin) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let current = 0;
    let started = false;
    let visible = true;
    let raf = 0;
    let lastTime = 0;
    let duration = 0;

    // Paint the current video frame into a canvas. Safari can leave a paused
    // video showing its poster while `currentTime` changes; the canvas is the
    // image the visitor actually sees, so it gets the seeked frame directly.
    const paint = () => {
      if (!canvas || !context || video.readyState < 2 || !video.videoWidth) return;
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        host.dataset.painted = 'true';
      } catch {
        // If the decoder cannot hand us a frame, the underlying video and its
        // poster remain visible instead.
      }
    };

    const queuePaint = () => {
      if (paintRaf) cancelAnimationFrame(paintRaf);
      paintRaf = requestAnimationFrame(() => {
        paintRaf = requestAnimationFrame(paint);
      });
    };

    const filmEnd = () => Math.max(FILM_START + 0.2, duration - 0.08);

    const seek = (progress: number) => {
      if (!duration) return;
      const end = filmEnd();
      const time = FILM_START + (end - FILM_START) * clamp01(progress);
      if (Math.abs(video.currentTime - time) > 0.03) {
        try {
          video.currentTime = time;
          queuePaint();
        } catch {
          // The poster remains in place until the browser can seek.
        }
      }
    };

    const updateProgress = (progress: number) => {
      section.style.setProperty('--cinema-p', progress.toFixed(4));
      seek(progress);
    };

    const tick = (time: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      // Do not let a slow frame rate stall the scrub. Capping this at 50 ms
      // made the film fall behind on high-resolution or throttled displays.
      const delta = lastTime ? Math.min(0.25, (time - lastTime) / 1000) : 0.016;
      lastTime = time;
      // Keep the first and last frames exact at the hero boundaries. The
      // damping is for the journey; it must not leave the next section
      // visible while the film is still catching up to its final frame.
      if (target <= 0.001 || target >= 0.999) {
        current = target;
        updateProgress(current);
        raf = 0;
        return;
      }
      const damping = 1 - Math.exp(-delta * 8.5);
      current += (target - current) * damping;

      if (Math.abs(target - current) < 0.0007) {
        current = target;
        updateProgress(current);
        raf = 0;
        return;
      }

      updateProgress(current);
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible) return;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    };

    const readScroll = () => {
      if (!started) return;
      const sectionRect = section.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - pin.offsetHeight);
      target = clamp01((pinRect.top - sectionRect.top) / travel);
      const act = target < 0.3 ? '1' : target < 0.62 ? '2' : '3';
      if (section.dataset.act !== act) section.dataset.act = act;
      wake();
    };

    const resize = () => {
      readScroll();
      if (!raf) updateProgress(current);
    };

    const onVisibility = () => {
      if (!document.hidden) {
        visible = true;
        wake();
      }
    };

    const onPageHide = () => {
      visible = false;
    };

    const onPageShow = () => {
      visible = true;
      wake();
    };

    const primeDecoder = () => {
      // iOS may refuse the gesture-free prime in low-power mode. A touch or
      // click retries it and unlocks frame-after-frame seeking.
      void video
        .play()
        .then(() => {
          video.pause();
          updateProgress(current);
          queuePaint();
        })
        .catch(() => undefined);
    };

    const onLoadedMetadata = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      started = true;
      updateProgress(current);
      // Prime the decoder once without playing the film. This makes repeated
      // currentTime seeks work on iOS, then immediately returns to a still.
      primeDecoder();
      queuePaint();
      if (!reducedMotion) readScroll();
    };

    const onVideoError = () => {
      // The poster is the complete fallback; there is nothing to seek.
      started = false;
    };

    const onCanPlay = () => {
      // `loadedmetadata` can arrive before enough data is buffered to paint the
      // seeked frame. Re-apply the current position once the decoder is ready.
      if (duration) updateProgress(current);
      queuePaint();
    };

    const onSeeked = () => {
      paint();
    };

    const onFirstGesture = () => {
      if (video.paused) primeDecoder();
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadeddata', queuePaint);
    video.addEventListener('seeked', onSeeked);

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    }
    video.addEventListener('error', onVideoError);

    if (reducedMotion) {
      // Hold a composed city frame instead of animating the film.
      duration = 10;
      current = 0.62;
      target = 0.62;
      updateProgress(current);
    } else {
      startScroll();
    }

    function startScroll() {
      window.addEventListener('scroll', readScroll, { passive: true });
      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('pageshow', onPageShow);
      window.addEventListener('touchstart', onFirstGesture, { passive: true, once: true });
      window.addEventListener('pointerdown', onFirstGesture, { passive: true, once: true });
      readScroll();
    }

    return () => {
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('touchstart', onFirstGesture);
      window.removeEventListener('pointerdown', onFirstGesture);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onVideoError);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadeddata', queuePaint);
      video.removeEventListener('seeked', onSeeked);
      if (raf) cancelAnimationFrame(raf);
      if (paintRaf) cancelAnimationFrame(paintRaf);
      video.pause();
    };
  }, []);

  return (
    <div className="ps-film" ref={hostRef} aria-hidden="true">
      <video
        ref={videoRef}
        className="ps-film__video"
        src={FILM_SRC}
        poster={POSTER_SRC}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
      />
      <canvas ref={canvasRef} className="ps-film__canvas" />
      <div className="ps-film__grade" />
    </div>
  );
}
