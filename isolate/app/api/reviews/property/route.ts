import { NextResponse } from 'next/server';
import { getReviewsForProperty } from '@/server/reviews/service';
export async function GET(request: Request) { const propertyId = new URL(request.url).searchParams.get('propertyId'); if (!propertyId) return NextResponse.json({ ok:false, message:'Property ID is required.' }, { status: 400 }); return NextResponse.json({ ok:true, ...(await getReviewsForProperty(propertyId)) }); }
