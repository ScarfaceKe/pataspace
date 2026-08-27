import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppLoadingProviders } from '@/components/system/AppLoadingProviders';

export const metadata: Metadata = {
  title: 'PataSpace — Smart Rental Discovery in Kenya',
  description:
    'PataSpace helps Kenyans find houses, shops, offices, and event halls through guided, trustworthy rental discovery.',
  applicationName: 'PataSpace',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'PataSpace',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: true,
    address: false,
    email: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-KE">
      <body>
        {/*
          IMMEDIATE Kenya map loading screen — renders as HTML before React hydrates.
          This is the FIRST visual the user sees. No blank screen, no green screen.
        */}
        <div id="ps-immediate-loader" style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a1a17',
          transition: 'opacity 0.8s ease, visibility 0.8s ease',
        }}>
          <svg viewBox="0 0 750 947" style={{ width: '75vmin', maxWidth: 520, height: 'auto' }} aria-hidden="true">
            {/* Kenya outline glow */}
            <defs>
              <filter id="ps-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer glow stroke */}
            <path d="M200.3,84.0 L244.9,99.0 L318.3,110.3 L401.2,170.5 L446.2,173.8 L488.5,180.7 L534.2,180.5 L599.8,130.4 L672.6,144.4 L692.4,196.4 L651.4,360.2 L652.2,550.5 L700.0,642.8 L662.4,668.3 L646.3,669.4 L646.1,683.2 L644.1,689.4 L633.4,709.2 L584.6,741.6 L579.5,780.4 L565.3,792.9 L552.0,812.0 L543.7,843.5 L534.5,845.5 L529.9,882.1 L516.8,897.0 L484.4,895.7 L373.2,805.9 L368.5,788.0 L160.9,643.7 L50.0,502.9 L72.9,436.2 L102.1,396.0 L132.4,354.5 L131.6,293.3 L117.6,241.8 L103.3,232.0 L87.2,184.3 L74.7,158.0 L61.5,148.1 L54.6,120.6 L177.0,50.0 L200.3,84.0 Z" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="10" filter="url(#ps-glow)" />
            {/* 3D shadow layer */}
            <path d="M200.3,84.0 L244.9,99.0 L318.3,110.3 L401.2,170.5 L446.2,173.8 L488.5,180.7 L534.2,180.5 L599.8,130.4 L672.6,144.4 L692.4,196.4 L651.4,360.2 L652.2,550.5 L700.0,642.8 L662.4,668.3 L646.3,669.4 L646.1,683.2 L644.1,689.4 L633.4,709.2 L584.6,741.6 L579.5,780.4 L565.3,792.9 L552.0,812.0 L543.7,843.5 L534.5,845.5 L529.9,882.1 L516.8,897.0 L484.4,895.7 L373.2,805.9 L368.5,788.0 L160.9,643.7 L50.0,502.9 L72.9,436.2 L102.1,396.0 L132.4,354.5 L131.6,293.3 L117.6,241.8 L103.3,232.0 L87.2,184.3 L74.7,158.0 L61.5,148.1 L54.6,120.6 L177.0,50.0 L200.3,84.0 Z" fill="none" stroke="rgba(0,40,30,0.08)" strokeWidth="8" transform="translate(3,4)" />
            {/* Main outline */}
            <path d="M200.3,84.0 L244.9,99.0 L318.3,110.3 L401.2,170.5 L446.2,173.8 L488.5,180.7 L534.2,180.5 L599.8,130.4 L672.6,144.4 L692.4,196.4 L651.4,360.2 L652.2,550.5 L700.0,642.8 L662.4,668.3 L646.3,669.4 L646.1,683.2 L644.1,689.4 L633.4,709.2 L584.6,741.6 L579.5,780.4 L565.3,792.9 L552.0,812.0 L543.7,843.5 L534.5,845.5 L529.9,882.1 L516.8,897.0 L484.4,895.7 L373.2,805.9 L368.5,788.0 L160.9,643.7 L50.0,502.9 L72.9,436.2 L102.1,396.0 L132.4,354.5 L131.6,293.3 L117.6,241.8 L103.3,232.0 L87.2,184.3 L74.7,158.0 L61.5,148.1 L54.6,120.6 L177.0,50.0 L200.3,84.0 Z" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1.8" />
            {/* Interior fill */}
            <path d="M200.3,84.0 L244.9,99.0 L318.3,110.3 L401.2,170.5 L446.2,173.8 L488.5,180.7 L534.2,180.5 L599.8,130.4 L672.6,144.4 L692.4,196.4 L651.4,360.2 L652.2,550.5 L700.0,642.8 L662.4,668.3 L646.3,669.4 L646.1,683.2 L644.1,689.4 L633.4,709.2 L584.6,741.6 L579.5,780.4 L565.3,792.9 L552.0,812.0 L543.7,843.5 L534.5,845.5 L529.9,882.1 L516.8,897.0 L484.4,895.7 L373.2,805.9 L368.5,788.0 L160.9,643.7 L50.0,502.9 L72.9,436.2 L102.1,396.0 L132.4,354.5 L131.6,293.3 L117.6,241.8 L103.3,232.0 L87.2,184.3 L74.7,158.0 L61.5,148.1 L54.6,120.6 L177.0,50.0 L200.3,84.0 Z" fill="url(#ps-fill)" />
            <defs><linearGradient id="ps-fill" x1="50" y1="50" x2="700" y2="900"><stop offset="0%" stopColor="rgba(16,185,129,0.02)" /><stop offset="50%" stopColor="rgba(16,185,129,0.04)" /><stop offset="100%" stopColor="rgba(16,185,129,0.01)" /></linearGradient></defs>
            {/* City dots with CSS pulsing animation */}
            <g className="ps-dots-group">
              {[
                [296.0, 607.0, 0], [540.0, 850.4, 0.4], [119.9, 501.7, 0.8],
                [231.2, 519.5, 1.2], [162.9, 447.2, 1.6], [317.2, 584.6, 2.0],
                [571.1, 777.5, 2.4], [262.5, 556.1, 2.8], [307.1, 529.9, 3.2],
                [333.8, 627.0, 0.2], [366.6, 488.6, 0.6], [118.6, 467.7, 1.0],
                [140.2, 402.6, 1.4], [537.1, 532.8, 1.8], [645.8, 693.7, 2.2],
              ].map(([cx, cy, delay], i) => (
                <g key={i} className="ps-city-pulse" style={{ animationDelay: `${delay}s` }}>
                  <circle cx={cx} cy={cy} r="14" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1" className="ps-ring" />
                  <circle cx={cx} cy={cy} r="7" fill="rgba(16,185,129,0.15)" className="ps-glow" />
                  <circle cx={cx} cy={cy} r="3.5" fill="rgba(16,185,129,0.9)" />
                  <circle cx={cx} cy={cy} r="1.5" fill="rgba(200,255,230,0.8)" />
                </g>
              ))}
            </g>
          </svg>
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ color: 'rgba(16,185,129,0.7)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>PataSpace</p>
            <p style={{ color: 'rgba(16,185,129,0.35)', fontSize: '0.72rem', marginTop: 8, margin: '8px 0 0' }}>Connecting Kenya...</p>
          </div>
        </div>
        {/*
          Inline script to remove the loader once React hydrates.
          Runs BEFORE React — just sets a flag. React reads the flag and fades the loader.
        */}
        <script dangerouslySetInnerHTML={{ __html: `window.__ps_loader_el=document.getElementById('ps-immediate-loader');` }} />
        <AppLoadingProviders />
        {children}
      </body>
    </html>
  );
}
