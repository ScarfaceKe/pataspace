import type { KenyaLocationNode } from './types';

export const KENYA_ROOT_LOCATION: KenyaLocationNode = {
  id: 'ke',
  name: 'Kenya',
  level: 'country'
};

export const FEATURED_KENYA_LOCATIONS: readonly KenyaLocationNode[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    level: 'county',
    parentId: 'ke',
    county: 'Nairobi',
    children: [
      { id: 'westlands', name: 'Westlands', level: 'area', parentId: 'nairobi', county: 'Nairobi' },
      { id: 'kileleshwa', name: 'Kileleshwa', level: 'estate', parentId: 'nairobi', county: 'Nairobi' },
      { id: 'kasarani', name: 'Kasarani', level: 'area', parentId: 'nairobi', county: 'Nairobi' },
      { id: 'embakasi', name: 'Embakasi', level: 'area', parentId: 'nairobi', county: 'Nairobi' },
      { id: 'rongai', name: 'Rongai', level: 'town', parentId: 'nairobi', county: 'Nairobi', aliases: ['Ongata Rongai'] }
    ]
  },
  { id: 'mombasa', name: 'Mombasa', level: 'county', parentId: 'ke', county: 'Mombasa' },
  { id: 'kisumu', name: 'Kisumu', level: 'county', parentId: 'ke', county: 'Kisumu' },
  { id: 'uasingishu-eldoret', name: 'Eldoret', level: 'town', parentId: 'uasingishu', county: 'Uasin Gishu' },
  { id: 'nakuru', name: 'Nakuru', level: 'county', parentId: 'ke', county: 'Nakuru' },
  { id: 'kajiado-kitengela', name: 'Kitengela', level: 'town', parentId: 'kajiado', county: 'Kajiado' },
  { id: 'machakos', name: 'Machakos', level: 'county', parentId: 'ke', county: 'Machakos' },
  { id: 'kiambu-thika', name: 'Thika', level: 'town', parentId: 'kiambu', county: 'Kiambu' },
  { id: 'nakuru-naivasha', name: 'Naivasha', level: 'town', parentId: 'nakuru', county: 'Nakuru' },
  { id: 'nyeri', name: 'Nyeri', level: 'county', parentId: 'ke', county: 'Nyeri' },
  { id: 'embu', name: 'Embu', level: 'county', parentId: 'ke', county: 'Embu' },
  { id: 'meru', name: 'Meru', level: 'county', parentId: 'ke', county: 'Meru' },
  { id: 'kakamega', name: 'Kakamega', level: 'county', parentId: 'ke', county: 'Kakamega' },
  { id: 'kisii', name: 'Kisii', level: 'county', parentId: 'ke', county: 'Kisii' },
  { id: 'kilifi-malindi', name: 'Malindi', level: 'town', parentId: 'kilifi', county: 'Kilifi' },
  { id: 'laikipia-nanyuki', name: 'Nanyuki', level: 'town', parentId: 'laikipia', county: 'Laikipia' }
] as const;

export const LOCATION_ARCHITECTURE_RULES = {
  countryCode: 'KE',
  hierarchy: ['country', 'county', 'town', 'area', 'estate', 'suburb', 'market-centre', 'village'],
  supportedCoverage:
    'Every Kenyan county, town, estate, suburb, market centre, village, and growing urban area must fit this hierarchy.'
} as const;

export function isKenyaLocation(location: { countryCode?: string; country?: string }): boolean {
  return location.countryCode === 'KE' || location.country?.toLowerCase() === 'kenya';
}
