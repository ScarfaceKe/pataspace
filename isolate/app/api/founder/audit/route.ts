import { NextResponse } from 'next/server';
import { getFounderAuditTrail } from '@/server/founder-admin/service';

export async function GET() { return NextResponse.json({ ok: true, auditTrail: await getFounderAuditTrail() }); }
