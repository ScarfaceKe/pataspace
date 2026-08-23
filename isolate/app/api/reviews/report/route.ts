import { NextResponse } from 'next/server';
import { reportReview } from '@/server/reviews/service';
export async function POST(request: Request) { const review = await reportReview(await request.json()); if (!review) return NextResponse.json({ ok:false, message:'Review not found.' }, { status: 404 }); return NextResponse.json({ ok:true, message:'Review submitted for moderation.', review }); }
