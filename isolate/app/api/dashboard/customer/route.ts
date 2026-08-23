import { NextResponse } from 'next/server';
import { getProfileFromSessionCookie } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { getCustomerDashboardSnapshot } from '@/server/customer-dashboard/service';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))?.split('=')[1];
  const profile = await getProfileFromSessionCookie(cookie);
  if (!profile || profile.role !== 'customer') return NextResponse.json({ ok: false, message: 'Only the authorised customer can view this dashboard.' }, { status: 403 });
  return NextResponse.json({ ok: true, dashboard: await getCustomerDashboardSnapshot(profile) });
}
