'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { KenyaFallback } from './KenyaFallback';

type SceneProps = {
  onReady?: () => void;
  onFail?: () => void;
};

type NavigatorWithData = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/**
 * Progressive scene loader.
 *
 * The complete Kenya plate is server rendered first. The WebGL terrain is
 * loaded only after the page is interactive, and only when the device has
 * enough headroom. Reduced-motion, save-data, low-memory and no-WebGL devices
 * keep the static plate; no device ever gets a black hero.
 */
export function KenyaCinema() {
  const [allowScene, setAllowScene] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [staticOnly, setStaticOnly] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as NavigatorWithData;
    const hasSaveData = Boolean(nav.connection?.saveData);
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2;

    let hasWebGL2 = false;
    try {
      const probe = document.createElement('canvas');
      hasWebGL2 = Boolean(probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true }));
      probe.width = 0;
      probe.height = 0;
    } catch {
      hasWebGL2 = false;
    }

    if (reduced || hasSaveData || lowMemory || !hasWebGL2) {
      setStaticOnly(true);
      return;
    }

    // Let the server-rendered plate settle before paying for the 3D bundle.
    const timer = window.setTimeout(() => setAllowScene(true), 220);
    return () => window.clearTimeout(timer);
  }, []);

  // Import the scene only after the plate has had a chance to paint, and only
  // after the WebGL/reduced-motion checks above have passed.
  useEffect(() => {
    if (!allowScene) return;
    let cancelled = false;
    import('./KenyaScene')
      .then((mod) => {
        if (!cancelled) setScene(() => mod.KenyaScene);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [allowScene]);

  // If the chunk is slow or WebGL silently fails, return to the plate rather
  // than leaving a loading caption on screen forever.
  useEffect(() => {
    if (!allowScene || ready || failed) return;
    const watchdog = window.setTimeout(() => setFailed(true), 15000);
    return () => window.clearTimeout(watchdog);
  }, [allowScene, ready, failed]);

  return (
    <div className={`ps-kenya${ready ? ' is-ready' : ''}${failed || staticOnly ? ' is-static' : ''}`}>
      <KenyaFallback />
      {Scene && !failed ? (
        <Scene
          onReady={() => setReady(true)}
          onFail={() => {
            setFailed(true);
            setReady(false);
          }}
        />
      ) : null}
      <div className="ps-kenya__veil" aria-hidden="true" />
      <div className="ps-kenya__status" aria-hidden="true">
        <span className="ps-kenya__statusDot" />
        <span>{failed || staticOnly ? 'Static atlas' : ready ? 'Live terrain' : 'Terrain study'}</span>
        <span className="ps-kenya__statusScale">1:1,000,000</span>
      </div>
      {!ready && !failed && !staticOnly ? (
        <div className="ps-kenya__loading" aria-hidden="true">
          <span>Raising the terrain</span>
          <i />
        </div>
      ) : null}
    </div>
  );
}
