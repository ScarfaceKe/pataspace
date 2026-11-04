import type { Metadata, Viewport } from 'next';
import './globals.css';
import './atlas.css';
import { AppLoadingProviders } from '@/components/system/AppLoadingProviders';

export const metadata: Metadata = {
  title: 'PataSpace — Smart Rental Discovery in Kenya',
  description:
    'PataSpace helps Kenyans find houses, shops, offices, and event halls through guided matching, verified listings, and vacancy-confirmed rentals.',
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
  themeColor: '#0a241c'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-KE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        {/*
          Immediate brand splash. It renders as HTML before React hydrates,
          then AppLoadingProviders fades it out and removes it.
        */}
        <div id="ps-immediate-loader" aria-hidden="true" style={{ background: '#071a10', color: '#f3ecdc' }}>
          <svg className="ps-splash__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="13" height="13" fill="currentColor" />
            <rect x="18" y="1" width="13" height="13" stroke="currentColor" strokeWidth="1.6" />
            <rect x="1" y="18" width="13" height="13" stroke="currentColor" strokeWidth="1.6" />
            <rect x="18" y="18" width="13" height="13" fill="#e3a33b" />
          </svg>
          <p className="ps-splash__word">PataSpace</p>
          <p className="ps-splash__note">Kenya&apos;s rental atlas</p>
          <div className="ps-splash__bar">
            <i />
          </div>
        </div>
        <noscript>
          <style>{`#ps-immediate-loader{display:none!important}body{overflow:auto!important}`}</style>
        </noscript>
        <AppLoadingProviders />
        {children}
      </body>
    </html>
  );
}
