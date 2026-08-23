import { NextResponse } from 'next/server';
import { processWhatsAppWebhook, verifyWebhookChallenge } from '@/server/whatsapp/service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const challenge = verifyWebhookChallenge({ mode: url.searchParams.get('hub.mode'), token: url.searchParams.get('hub.verify_token'), challenge: url.searchParams.get('hub.challenge') });
  if (challenge === null) return new Response('Forbidden', { status: 403 });
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    return NextResponse.json(await processWhatsAppWebhook(rawBody, request.headers.get('x-hub-signature-256')));
  } catch {
    return NextResponse.json({ ok: false, message: 'WhatsApp webhook could not be processed.' }, { status: 500 });
  }
}
