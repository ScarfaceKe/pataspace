import { NextResponse } from 'next/server';
import { getViewingHistoryForCustomer, getViewingHistoryForResponsibleContact } from '@/server/viewings/service';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const customerId = params.get('customerId');
  const contactId = params.get('contactId');
  if (customerId) return NextResponse.json({ ok: true, viewings: await getViewingHistoryForCustomer(customerId) });
  if (contactId) return NextResponse.json({ ok: true, viewings: await getViewingHistoryForResponsibleContact(contactId) });
  return NextResponse.json({ ok: false, message: 'Provide customerId or contactId.' }, { status: 400 });
}
