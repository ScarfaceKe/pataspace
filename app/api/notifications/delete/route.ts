import { NextResponse } from 'next/server';
import { deleteNotification } from '@/server/notifications/service';

export async function POST(request: Request) {
  const body = await request.json();
  const deleted = await deleteNotification(String(body.userId ?? ''), String(body.notificationId ?? ''));
  if (!deleted) return NextResponse.json({ ok: false, message: 'Notification not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, deleted });
}
