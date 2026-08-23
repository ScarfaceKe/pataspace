export function GET() {
  return Response.json({
    name: 'PataSpace',
    short_name: 'PataSpace',
    description: 'Smart rental discovery in Kenya.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6fbf9',
    theme_color: '#0f766e',
    orientation: 'portrait-primary',
    categories: ['business', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
