import { HERO_FILM_BASE64 } from '@/server/hero-film';

const FILM = Uint8Array.from(Buffer.from(HERO_FILM_BASE64, 'base64'));
const ETAG = '"hero-film-v1"';

const BASE_HEADERS = {
  'Content-Type': 'video/mp4',
  'Accept-Ranges': 'bytes',
  'Cache-Control': 'public, max-age=31536000, immutable',
  ETag: ETAG,
  'Content-Disposition': 'inline; filename="pataspace-city.mp4"',
  'Content-Length': String(FILM.byteLength)
};

function parseRange(header: string | null): { start: number; end: number } | 'invalid' | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return 'invalid';

  const [, startText, endText] = match;
  if (!startText) {
    const suffixLength = Number(endText);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return 'invalid';
    return { start: Math.max(0, FILM.byteLength - suffixLength), end: FILM.byteLength - 1 };
  }

  const start = Number(startText);
  const requestedEnd = endText ? Number(endText) : FILM.byteLength - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd)) return 'invalid';
  if (start >= FILM.byteLength || requestedEnd < start) return 'invalid';

  return { start, end: Math.min(requestedEnd, FILM.byteLength - 1) };
}

export async function GET(request: Request) {
  const range = parseRange(request.headers.get('range'));

  if (range === 'invalid') {
    return new Response(null, {
      status: 416,
      headers: { ...BASE_HEADERS, 'Content-Range': `bytes */${FILM.byteLength}` }
    });
  }

  if (range) {
    const body = FILM.subarray(range.start, range.end + 1);
    return new Response(body, {
      status: 206,
      headers: {
        ...BASE_HEADERS,
        'Content-Length': String(body.byteLength),
        'Content-Range': `bytes ${range.start}-${range.end}/${FILM.byteLength}`
      }
    });
  }

  return new Response(FILM, { headers: BASE_HEADERS });
}

export async function HEAD() {
  return new Response(null, { headers: BASE_HEADERS });
}
