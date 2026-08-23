import { FEATURED_KENYA_LOCATIONS } from './locations';
import type { PropertyLocationInput } from './property-registration';

export interface KenyaLocationIntelligenceResult {
  recognised: boolean;
  matchedKnownLocationIds: string[];
  quietlyFlagForReview: boolean;
  adminAssistantRecommendedAction?: 'identify-new-location' | 'validate-spelling' | 'confirm-hierarchy';
}

export const KNOWN_KENYA_LOCATION_TERMS: readonly string[] = [
  ...FEATURED_KENYA_LOCATIONS.flatMap((location) => [location.name, location.county ?? '', ...(location.aliases ?? [])]),
  'Westlands',
  'Kileleshwa',
  'Kasarani',
  'Embakasi',
  'Ongata Rongai',
  'Rongai',
  'Karen',
  'Kilimani',
  'Roysambu',
  'Ruiru',
  'Kiambu',
  'Kikuyu',
  'Syokimau',
  'Mlolongo',
  'Diani',
  'Nyali',
  'Bamburi',
  'Likoni',
  'Milimani',
  'Kondele',
  'Langas',
  'Mtwapa',
  'Kericho',
  'Narok',
  'Garissa',
  'Isiolo',
  'Bungoma',
  'Busia',
  'Voi'
].filter(Boolean) as readonly string[];

export const KENYA_COUNTIES: readonly string[] = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang’a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot'
] as const;

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ');
}

export function analyseKenyaPropertyLocation(location: PropertyLocationInput): KenyaLocationIntelligenceResult {
  const values = [location.county, location.townOrCity, location.estateOrAreaOrNeighbourhood, location.street ?? '', location.landmark ?? ''];
  const normalisedValues = values.map(normalise).filter(Boolean);
  const knownTerms = [...KNOWN_KENYA_LOCATION_TERMS, ...KENYA_COUNTIES];
  const matchedKnownLocationIds = knownTerms
    .filter((term) => normalisedValues.some((value) => value.includes(normalise(term)) || normalise(term).includes(value)))
    .map((term) => normalise(term));
  const countyRecognised = KENYA_COUNTIES.some((county) => normalise(county) === normalise(location.county));
  const recognised = countyRecognised && matchedKnownLocationIds.length > 0;

  return {
    recognised,
    matchedKnownLocationIds: Array.from(new Set(matchedKnownLocationIds)),
    quietlyFlagForReview: !recognised,
    adminAssistantRecommendedAction: recognised ? undefined : 'identify-new-location'
  };
}
