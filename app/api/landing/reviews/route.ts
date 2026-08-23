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

export async function GET() {
  const { reviews } = await readReviewStore();

  const published = reviews
    .filter((r) => r.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const landingReviews: LandingReview[] = published.map((review) => ({
    id: review.id,
    rating: review.rating,
    writtenReview: review.writtenReview,
    propertyCategory: review.propertyCategory,
    createdAt: review.createdAt,
  }));

  return NextResponse.json({ ok: true, reviews: landingReviews });
}
