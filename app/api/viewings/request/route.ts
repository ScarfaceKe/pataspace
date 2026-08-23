import { NextResponse } from 'next/server';
import { createViewingRequest } from '@/server/viewings/service';

export async function POST(request: Request) {
  const result = await createViewingRequest(await request.json());
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json({ ok: true, message: 'Your viewing request has been sent.', viewing: result.viewing });
}
