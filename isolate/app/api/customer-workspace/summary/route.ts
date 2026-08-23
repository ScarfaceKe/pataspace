import { NextResponse } from 'next/server';
import { getProfileFromSessionCookie } from '@/server/auth/service';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';
import { getCustomerWorkspace } from '@/server/customer-workspace/service';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))?.split('=')[1];
  const profile = await getProfileFromSessionCookie(cookie);
  if (!profile || profile.role !== 'customer') return NextResponse.json({ ok: false, message: 'Only the authorised customer can view this workspace.' }, { status: 403 });
  return NextResponse.json({ ok: true, workspace: await getCustomerWorkspace(profile) });
}
