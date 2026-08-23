import { NextResponse } from 'next/server';
import { respondToReview } from '@/server/reviews/service';
export async function POST(request: Request) { const review = await respondToReview(await request.json()); if (!review) return NextResponse.json({ ok:false, message:'Review not found or already has an official response.' }, { status: 404 }); return NextResponse.json({ ok:true, review }); }
