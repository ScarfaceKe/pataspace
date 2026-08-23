import { NextResponse } from 'next/server';
import { saveFounderDashboardPersonalisation } from '@/server/executive-dashboard/service';
export async function POST(request: Request) { return NextResponse.json({ ok: true, personalisation: await saveFounderDashboardPersonalisation(await request.json()) }); }
