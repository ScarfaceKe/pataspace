import type { KenyaGeographicLocation } from '@/domain/unified-platform';
import { readStore, writeStore } from '@/server/database/json-store';

export interface GeographyStoreData { locations: KenyaGeographicLocation[] }
const now = new Date().toISOString();
const seededNames = ['Nairobi','Mombasa','Kisumu','Eldoret','Nakuru','Kitengela','Machakos','Thika','Naivasha','Nyeri','Embu','Meru','Kakamega','Kisii','Malindi','Nanyuki','Westlands','Kilimani','Kileleshwa','Ruiru','Syokimau','Mlolongo','Athi River','Karen','Rongai'];
const EMPTY_STORE: GeographyStoreData = { locations: seededNames.map((name) => ({ id: `seed-${name.toLowerCase().replace(/\s+/g, '-')}`, name, type: ['Westlands','Kilimani','Kileleshwa','Karen'].includes(name) ? 'estate' : 'town', county: undefined, aliases: [], validated: true, source: 'seeded', createdAt: now, updatedAt: now })) };
const STORE_KEY = 'unified_platform.geography';
export async function readGeographyStore(): Promise<GeographyStoreData> { return readStore<GeographyStoreData>(STORE_KEY, EMPTY_STORE); }
export async function writeGeographyStore(data: GeographyStoreData): Promise<void> { await writeStore<GeographyStoreData>(STORE_KEY, data); }
