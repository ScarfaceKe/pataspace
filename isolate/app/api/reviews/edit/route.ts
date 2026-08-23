import { NextResponse } from 'next/server';
import { editReview } from '@/server/reviews/service';
export async function POST(request: Request) { const review = await editReview(await request.json()); if (!review) return NextResponse.json({ ok:false, message:'Review not found or not editable.' }, { status: 404 }); return NextResponse.json({ ok:true, review }); }
