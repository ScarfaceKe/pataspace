export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0f766e"/><path d="M141 373V139h126c58 0 96 35 96 86 0 53-39 88-98 88h-58v60h-66Zm66-115h55c22 0 36-13 36-33s-14-32-36-32h-55v65Z" fill="#fff"/></svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
