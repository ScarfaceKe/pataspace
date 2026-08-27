/**
 * WhatsApp Webhook — Conversation Handler
 *
 * Receives incoming WhatsApp messages and routes them
 * to the vacancy conversation service for parsing and response.
 */

import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/server/whatsapp-conversation/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // WhatsApp Cloud API webhook format
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages || [];

    for (const message of messages) {
      if (message.type === 'text') {
        const senderPhone = message.from;
        const text = message.text?.body;

        if (senderPhone && text) {
          const result = await processIncomingMessage(senderPhone, text);

          if (result) {
            // Message was handled by the conversation system
            return NextResponse.json({
              ok: true,
              handled: true,
              conversationId: result.conversationId,
            });
          }
        }
      }
    }

    // Message not handled by conversation system
    return NextResponse.json({ ok: true, handled: false });
  } catch (error) {
    console.error('WhatsApp conversation webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}
