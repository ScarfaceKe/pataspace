import { NextResponse } from 'next/server';
import { processMegaPayCallback } from '@/server/payments/service';

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    const result = await processMegaPayCallback(rawBody, request.headers);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, message: 'Callback could not be processed.' }, { status: 500 });
  }
}
