import type { Metadata, Viewport } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
