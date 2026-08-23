import type { VacancyConfirmationRecord } from '@/domain/vacancy-confirmation';
import { readStore, writeStore } from '@/server/database/json-store';

export interface VacancyConfirmationStoreData {
  records: VacancyConfirmationRecord[];
}

const EMPTY_STORE: VacancyConfirmationStoreData = { records: [] };
const STORE_KEY = 'vacancy_confirmation';

export async function readVacancyConfirmationStore(): Promise<VacancyConfirmationStoreData> {
  return readStore<VacancyConfirmationStoreData>(STORE_KEY, EMPTY_STORE);
}

export async function writeVacancyConfirmationStore(data: VacancyConfirmationStoreData): Promise<void> {
  await writeStore<VacancyConfirmationStoreData>(STORE_KEY, data);
}
