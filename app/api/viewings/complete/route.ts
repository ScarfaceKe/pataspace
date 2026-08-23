import { NextResponse } from 'next/server';
import { completeViewing } from '@/server/viewings/service';

export async function POST(request: Request) {
  const viewing = await completeViewing(await request.json());
  if (!viewing) return NextResponse.json({ ok: false, message: 'Viewing request was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'The viewing has been marked as completed.', viewing });
}
