import { NextResponse } from 'next/server';
import { decideBusinessGoal } from '@/server/executive-intelligence/service';
export async function POST(request: Request) { return NextResponse.json({ ok: true, decision: await decideBusinessGoal(await request.json()) }); }
