import { NextResponse } from 'next/server';
import { markAllNotificationsRead } from '@/server/notifications/service';

export async function POST(request: Request) {
  const body = await request.json();
  const count = await markAllNotificationsRead(String(body.userId ?? ''));
  return NextResponse.json({ ok: true, count });
}
