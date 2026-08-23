import { NextResponse } from 'next/server';
import { readPropertyStore } from '@/server/properties/store';
import { getUnlockPriceForTarget, type UnlockTarget } from '@/domain/unlock';
import type { PropertyCategoryId } from '@/domain/types';
import type { ResidentialUnlockCategory, ShopUnlockCategory, OfficeUnlockCategory, EventHallUnlockCategory } from '@/domain/unlock';

export const dynamic = 'force-dynamic';

interface FeaturedListing {
  id: string;
  category: PropertyCategoryId;
  categoryName: string;
  icon: string;
  name: string;
  location: string;
  description: string;
  unitIdentifier?: string;
  unlockPrice: number;
  currency: string;
  verifiedAt?: string;
}

const CATEGORY_META: Record<PropertyCategoryId, { name: string; icon: string }> = {
  houses: { name: 'House', icon: '🏠' },
  shops: { name: 'Shop', icon: '🏪' },
  offices: { name: 'Office', icon: '🏢' },
  'event-halls': { name: 'Event Hall', icon: '🎉' },
  'mixed-use-building': { name: 'Mixed-Use Building', icon: '🏙️' },
};

function resolveUnlockPrice(property: { category: PropertyCategoryId; id: string }, unitIdentifier?: string): number {
  const target: UnlockTarget = {
    propertyId: property.id,
    unitIdentifier: unitIdentifier || 'main',
    propertyCategory: property.category,
    pricingCategory: getDefaultPricingCategory(property.category),
  };
  try {
    return getUnlockPriceForTarget(target, 'unlock-this-listing').amount;
  } catch {
    return 0;
  }
}

function getDefaultPricingCategory(category: PropertyCategoryId): ResidentialUnlockCategory | ShopUnlockCategory | OfficeUnlockCategory | EventHallUnlockCategory {
  switch (category) {
    case 'houses': return 'one-bedroom';
    case 'shops': return 'medium-shop';
    case 'offices': return 'small-office';
    case 'event-halls': return 'medium-event-hall';
    case 'mixed-use-building': return 'one-bedroom';
  }
}

export async function GET() {
  const { properties } = await readPropertyStore();

  const verified = properties.filter(
    (p) => p.status === 'active' && (p.verificationStatus === 'verified' || p.verificationStatus === 'pending-verification')
  );

  const categories: PropertyCategoryId[] = ['houses', 'shops', 'offices', 'event-halls'];
  const featured: FeaturedListing[] = [];

  for (const cat of categories) {
    const match = verified.find((p) => p.category === cat);
    if (match) {
      const meta = CATEGORY_META[cat];
      const locationStr = [match.location.estateOrAreaOrNeighbourhood, match.location.townOrCity, match.location.county]
        .filter(Boolean)
        .join(', ');
      featured.push({
        id: match.id,
        category: cat,
        categoryName: meta.name,
        icon: meta.icon,
        name: match.description?.slice(0, 80) || `${meta.name} in ${locationStr}`,
        location: locationStr || 'Kenya',
        description: match.description || '',
        unitIdentifier: match.vacancy?.unitIdentifiers?.[0],
        unlockPrice: resolveUnlockPrice(match, match.vacancy?.unitIdentifiers?.[0]),
        currency: 'KES',
        verifiedAt: match.submittedAt,
      });
    }
  }

  return NextResponse.json({ ok: true, featured });
}
