import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './session';

export function extractCookieValue(request: Request, name = SESSION_COOKIE_NAME): string | undefined {
  return request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function getRequestContext(request: Request): { ipAddress?: string | null; userAgent?: string | null } {
  return {
    ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
    userAgent: request.headers.get('user-agent')
  };
}

export function rejectInvalidOrigin(request: Request): NextResponse | null {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return null;
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const host = request.headers.get('host');
  if (!host) return null;
  try {
    const expected = new URL(request.url);
    const incoming = new URL(origin);
    if (incoming.host !== host || incoming.protocol !== expected.protocol) {
      return NextResponse.json({ ok: false, message: 'Security validation failed. Please refresh and try again.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false, message: 'Security validation failed. Please refresh and try again.' }, { status: 403 });
  }
  return null;
}
