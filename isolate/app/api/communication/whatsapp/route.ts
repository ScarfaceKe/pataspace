import { NextResponse } from 'next/server';
import { preparePropertyWhatsAppMessage } from '@/server/communication/service';
export async function POST(request: Request) { return NextResponse.json({ ok:true, whatsapp: preparePropertyWhatsAppMessage(await request.json()) }); }
