import { NextResponse } from 'next/server';
import { cancelViewing } from '@/server/viewings/service';

export async function POST(request: Request) {
  const viewing = await cancelViewing(await request.json());
  if (!viewing) return NextResponse.json({ ok: false, message: 'Viewing request was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'The viewing request was cancelled.', viewing });
}
