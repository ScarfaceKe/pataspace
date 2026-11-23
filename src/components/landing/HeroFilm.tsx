'use client';

import { useEffect, useRef } from 'react';

const FILM_SRC = '/api/hero-film?v=4';
const POSTER_SRC = '/hero/pataspace-city-poster-v2.jpg';

/** The poster is full-bleed behind the film; the film fills the panel. */
const POSTER_ASPECT = 720 / 1280;

/** How far down the page counts as having left the top. */
const TOP_RETURN_OFFSET = 24;

/**
 * The supplied founder film is the hero artwork. It is silent, starts by
 * itself as soon as the page opens, and plays once to the end, where it holds
 * the last frame. Scrolling back to the top of the page starts it over.
 */
export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let leftTop = window.scrollY > TOP_RETURN_OFFSET;

    const play = () => {
      const attempt = video.play();
      if (attempt) attempt.catch(() => undefined);
    };

    const onScroll = () => {
      if (window.scrollY > TOP_RETURN_OFFSET) {
        leftTop = true;
        return;
      }
      if (!leftTop) return;
      // Back at the top: start the film again from its first frame.
      leftTop = false;
      if (video.readyState >= 1) video.currentTime = 0;
      play();
    };

    // Muted inline autoplay normally starts without a gesture. If a browser
    // still refuses, the visitor's first input retries it.
    const onFirstGesture = () => {
      if (video.paused && !video.ended) play();
    };

    play();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onFirstGesture, { passive: true, once: true });
    window.addEventListener('touchstart', onFirstGesture, { passive: true, once: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      video.pause();
    };
  }, []);

  return (
    <div className="ps-film" aria-hidden="true">
      <video
        ref={videoRef}
        className="ps-film__video"
        src={FILM_SRC}
        poster={POSTER_SRC}
        autoPlay
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
