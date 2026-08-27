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
          <svg viewBox="0 0 800 900" style={{ width: '70vmin', maxWidth: 420, height: 'auto' }} aria-hidden="true">
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
            <path d="M668.0,559.1 L715.3,625.1 L659.3,657.1 L639.5,690.5 L609.6,696.3 L598.2,752.7 L572.5,785.0 L556.9,838.2 L524.7,864.6 L409.9,784.6 L404.4,738.2 L114.3,575.3 L100.8,566.5 L100.0,481.7 L122.9,449.3 L162.3,396.3 L191.4,338.0 L156.2,246.2 L146.8,206.0 L108.9,150.5 L158.1,102.7 L212.4,50.0 L253.9,63.4 L253.9,108.3 L281.2,134.7 L336.9,134.7 L438.2,202.6 L463.5,203.4 L482.2,201.2 L499.9,210.4 L553.3,216.7 L576.9,183.4 L650.0,149.9 L682.3,177.0 L736.9,177.0 L667.0,267.7 Z" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="8" filter="url(#ps-glow)" />
            {/* Main outline */}
            <path d="M668.0,559.1 L715.3,625.1 L659.3,657.1 L639.5,690.5 L609.6,696.3 L598.2,752.7 L572.5,785.0 L556.9,838.2 L524.7,864.6 L409.9,784.6 L404.4,738.2 L114.3,575.3 L100.8,566.5 L100.0,481.7 L122.9,449.3 L162.3,396.3 L191.4,338.0 L156.2,246.2 L146.8,206.0 L108.9,150.5 L158.1,102.7 L212.4,50.0 L253.9,63.4 L253.9,108.3 L281.2,134.7 L336.9,134.7 L438.2,202.6 L463.5,203.4 L482.2,201.2 L499.9,210.4 L553.3,216.7 L576.9,183.4 L650.0,149.9 L682.3,177.0 L736.9,177.0 L667.0,267.7 Z" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1.8" />
            {/* Subtle interior fill */}
            <path d="M668.0,559.1 L715.3,625.1 L659.3,657.1 L639.5,690.5 L609.6,696.3 L598.2,752.7 L572.5,785.0 L556.9,838.2 L524.7,864.6 L409.9,784.6 L404.4,738.2 L114.3,575.3 L100.8,566.5 L100.0,481.7 L122.9,449.3 L162.3,396.3 L191.4,338.0 L156.2,246.2 L146.8,206.0 L108.9,150.5 L158.1,102.7 L212.4,50.0 L253.9,63.4 L253.9,108.3 L281.2,134.7 L336.9,134.7 L438.2,202.6 L463.5,203.4 L482.2,201.2 L499.9,210.4 L553.3,216.7 L576.9,183.4 L650.0,149.9 L682.3,177.0 L736.9,177.0 L667.0,267.7 Z" fill="url(#ps-fill)" />
            <defs><linearGradient id="ps-fill" x1="100" y1="50" x2="737" y2="865"><stop offset="0%" stopColor="rgba(16,185,129,0.02)" /><stop offset="50%" stopColor="rgba(16,185,129,0.04)" /><stop offset="100%" stopColor="rgba(16,185,129,0.01)" /></linearGradient></defs>
            {/* City dots with CSS pulsing animation */}
            <g className="ps-dots-group">
              {[
                [334.3, 593.8, 0], [562.0, 814.0, 0.4], [170.0, 498.7, 0.8],
                [273.8, 514.7, 1.2], [210.1, 449.3, 1.6], [354.1, 573.6, 2.0],
                [591.1, 748.0, 2.4], [303.0, 547.8, 2.8], [344.7, 524.1, 3.2],
                [369.6, 611.9, 0.2], [400.2, 486.7, 0.6], [168.8, 467.9, 1.0],
                [188.9, 409.0, 1.4], [559.3, 526.7, 1.8], [660.7, 672.2, 2.2],
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
