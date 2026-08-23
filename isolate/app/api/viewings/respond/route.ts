import { NextResponse } from 'next/server';
import { respondToViewing } from '@/server/viewings/service';

export async function POST(request: Request) {
  const viewing = await respondToViewing(await request.json());
  if (!viewing) return NextResponse.json({ ok: false, message: 'Viewing request was not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'Viewing status updated.', viewing });
}
