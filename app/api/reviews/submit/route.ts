import { NextResponse } from 'next/server';
import { submitReview } from '@/server/reviews/service';
export async function POST(request: Request) { const result = await submitReview(await request.json()); if (!result.ok) return NextResponse.json(result, { status: result.status }); return NextResponse.json({ ok: true, review: result.review }); }
