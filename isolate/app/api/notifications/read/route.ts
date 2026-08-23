import { NextResponse } from 'next/server';
import { markNotificationRead } from '@/server/notifications/service';

export async function POST(request: Request) {
  const body = await request.json();
  const notification = await markNotificationRead(String(body.userId ?? ''), String(body.notificationId ?? ''));
  if (!notification) return NextResponse.json({ ok: false, message: 'Notification not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, notification });
}
