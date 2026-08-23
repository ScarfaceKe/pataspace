import { NextResponse } from 'next/server';
import { evaluateSavedSearch } from '@/server/recommendations/service';
export async function POST(request: Request) { return NextResponse.json({ ok: true, evaluation: await evaluateSavedSearch(await request.json()) }); }
