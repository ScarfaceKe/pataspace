import { NextResponse } from 'next/server';
import { readReviewStore } from '@/server/reviews/store';

export const dynamic = 'force-dynamic';

interface LandingReview {
  id: string;
  rating: number;
  writtenReview?: string;
  propertyCategory: string;
  createdAt: string;
}

async function getLandingReviews(): Promise<LandingReview[]> {
  const { reviews } = await readReviewStore();

  const published = reviews
    .filter((review) => review.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return published.map((review) => ({
    id: review.id,
    rating: review.rating,
    writtenReview: review.writtenReview,
    propertyCategory: review.propertyCategory,
    createdAt: review.createdAt,
  }));
}

export async function GET() {
  try {
    return NextResponse.json({ ok: true, reviews: await getLandingReviews() });
  } catch {
    // Reviews are a trust signal, never a gate. Keep the landing available and
    // let the client show its verified-empty state while storage is down.
    return NextResponse.json({ ok: true, reviews: [] });
  }
}
