'use client';

import { useEffect, useRef } from 'react';

const FILM_SRC = '/api/hero-film?v=1';
const POSTER_SRC = '/hero/pataspace-city-poster.jpg';

/** Skip the dark opening so the city is present from the first frame. */
const FILM_START = 3.5;

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

  useEffect(() => {
    const host = hostRef.current;
    const video = videoRef.current;
    if (!host || !video) return;

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

    const filmEnd = () => Math.max(FILM_START + 0.2, duration - 0.08);

    const seek = (progress: number) => {
      if (!duration) return;
      const end = filmEnd();
      const time = FILM_START + (end - FILM_START) * clamp01(progress);
      if (Math.abs(video.currentTime - time) > 0.03) {
        try {
          video.currentTime = time;
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
      const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
      lastTime = time;
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

    const onLoadedMetadata = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      started = true;
      updateProgress(current);
      // Prime the decoder once without playing the film. This makes repeated
      // currentTime seeks work on iOS, then immediately returns to a still.
      void video
        .play()
        .then(() => video.pause())
        .catch(() => undefined);
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
    };

    video.addEventListener('canplay', onCanPlay);

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
      readScroll();
    }

    return () => {
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onVideoError);
      video.removeEventListener('canplay', onCanPlay);
      if (raf) cancelAnimationFrame(raf);
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
      <div className="ps-film__grade" />
    </div>
  );
}
