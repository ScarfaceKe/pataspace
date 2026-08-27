import { readStore, writeStore } from '@/server/database/json-store';
import type { WhatsAppVacancyConversation } from '@/domain/whatsapp-vacancy-conversation';

interface ConversationStore {
  conversations: WhatsAppVacancyConversation[];
}

const STORE_KEY = 'whatsapp-vacancy-conversations';

export async function readConversationStore(): Promise<ConversationStore> {
  return readStore<ConversationStore>(STORE_KEY, { conversations: [] });
}

export async function writeConversationStore(data: ConversationStore): Promise<void> {
  await writeStore(STORE_KEY, data);
}
