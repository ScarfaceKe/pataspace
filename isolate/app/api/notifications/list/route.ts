import { NextResponse } from 'next/server';
import { listNotifications } from '@/server/notifications/service';

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ ok: false, message: 'User ID is required.' }, { status: 400 });
  return NextResponse.json({ ok: true, notifications: await listNotifications(userId) });
}
