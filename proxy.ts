import { NextResponse, type NextRequest } from 'next/server';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type RateLimitRule = { key: string; limit: number; windowMs: number };
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function rateLimitRule(pathname: string): RateLimitRule | null {
  if (pathname === '/api/auth/login') return { key: 'auth-login', limit: 10, windowMs: 15 * 60_000 };
  if (pathname === '/api/auth/register') return { key: 'auth-register', limit: 5, windowMs: 30 * 60_000 };
  if (pathname === '/api/auth/forgot-password') return { key: 'auth-forgot', limit: 5, windowMs: 15 * 60_000 };
  if (pathname === '/api/viewings/request') return { key: 'viewing-request', limit: 10, windowMs: 10 * 60_000 };
  if (pathname.startsWith('/api/payments/')) return { key: 'payment', limit: 8, windowMs: 5 * 60_000 };
  if (pathname.startsWith('/api/communication/') || pathname.includes('contact')) return { key: 'contact', limit: 20, windowMs: 5 * 60_000 };
  return null;
}

function enforceRateLimit(request: NextRequest): NextResponse | null {
  if (!mutatingMethods.has(request.method)) return null;
  const rule = rateLimitRule(request.nextUrl.pathname);
  if (!rule) return null;
  const now = Date.now();
  const key = `${rule.key}:${clientIp(request)}`;
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > rule.limit) {
    return NextResponse.json({ ok: false, message: 'Too many requests. Please wait a few minutes and try again.' }, { status: 429 });
  }
  return null;
}

function enforceCsrf(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith('/api/') || !mutatingMethods.has(request.method)) return null;
  const origin = request.headers.get('origin');
  // Server-to-server callbacks normally omit Origin. Browser-originated mutations must match the current host.
  if (!origin) return null;
  try {
    const incoming = new URL(origin);
    if (incoming.host !== request.headers.get('host') || incoming.protocol !== request.nextUrl.protocol) {
      return NextResponse.json({ ok: false, message: 'Security validation failed. Please refresh and try again.' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false, message: 'Security validation failed. Please refresh and try again.' }, { status: 403 });
  }
  return null;
}

function enforceWafRules(request: NextRequest): NextResponse | null {
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`.toLowerCase();
  const suspiciousPatterns = [
    /\.\.\//,
    /<script/,
    /\bunion\b.*\bselect\b/,
    /\binsert\b.*\binto\b/,
    /\bdrop\b.*\btable\b/,
    /\bupdate\b.*\bset\b/,
    /\/wp-admin/,
    /\/wp-login/,
    /phpmyadmin/
  ];
  if (suspiciousPatterns.some((pattern) => pattern.test(target))) {
    return NextResponse.json({ ok: false, message: 'Request blocked by security policy.' }, { status: 403 });
  }
  return null;
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (process.env.NODE_ENV === 'production') response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const wafBlocked = enforceWafRules(request);
  if (wafBlocked) return withSecurityHeaders(wafBlocked);
  const csrfBlocked = enforceCsrf(request);
  if (csrfBlocked) return withSecurityHeaders(csrfBlocked);
  const rateLimited = enforceRateLimit(request);
  if (rateLimited) return withSecurityHeaders(rateLimited);

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/api/:path*']
};
