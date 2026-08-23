import { buildGeographicLocationId, type GeographicLearningCandidate, type KenyaGeographicLocation } from '@/domain/unified-platform';
import { readGeographyStore, writeGeographyStore } from './geography-store';

function nowIso(): string { return new Date().toISOString(); }
function sameName(a: string, b: string): boolean { return a.trim().toLowerCase() === b.trim().toLowerCase(); }

export async function listKenyaGeographicLocations(): Promise<KenyaGeographicLocation[]> {
  return (await readGeographyStore()).locations.sort((a, b) => a.name.localeCompare(b.name));
}

export async function learnGeographicLocation(candidate: GeographicLearningCandidate): Promise<KenyaGeographicLocation> {
  const store = await readGeographyStore();
  const existing = store.locations.find((loc) => sameName(loc.name, candidate.name) && loc.type === candidate.type && loc.county === candidate.county);
  if (existing) return existing;
  const timestamp = nowIso();
  const location: KenyaGeographicLocation = { id: buildGeographicLocationId(candidate.type, candidate.name, candidate.county), name: candidate.name.trim(), type: candidate.type, county: candidate.county, parentId: candidate.parentId, aliases: [], validated: candidate.registrationEvidence.length > 0, source: 'registration-learning', createdAt: timestamp, updatedAt: timestamp };
  store.locations.push(location);
  await writeGeographyStore(store);
  return location;
}

export async function founderUpsertLocation(input: Omit<KenyaGeographicLocation, 'createdAt' | 'updatedAt' | 'source'> & { mergeDuplicateIds?: string[] }): Promise<KenyaGeographicLocation> {
  const store = await readGeographyStore();
  const timestamp = nowIso();
  const existingIndex = store.locations.findIndex((loc) => loc.id === input.id);
  const location: KenyaGeographicLocation = { ...input, source: 'founder-managed', createdAt: existingIndex >= 0 ? store.locations[existingIndex].createdAt : timestamp, updatedAt: timestamp };
  if (existingIndex >= 0) store.locations[existingIndex] = location;
  else store.locations.push(location);
  if (input.mergeDuplicateIds?.length) store.locations = store.locations.filter((loc) => !input.mergeDuplicateIds?.includes(loc.id));
  await writeGeographyStore(store);
  return location;
}
