/**
 * WhatsApp Vacancy Conversation Service
 *
 * Manages two-way WhatsApp conversations for vacancy confirmation.
 * Handles: daily confirmations, dormant outreach, owner escalation.
 * Respects quiet hours, smart greetings, and message frequency limits.
 */

import { randomUUID } from 'node:crypto';
import {
  type WhatsAppVacancyConversation,
  type ConversationMessage,
  type ConversationState,
  type ConversationType,
  isQuietHours,
  getSmartGreeting,
  detectMessageLanguage,
  ESCALATION_RULES,
  VACANCY_CONFIRMATION_TEMPLATES,
} from '@/domain/whatsapp-vacancy-conversation';
import { parseVacancyResponse, type ParseContext } from '@/server/ai-conversation/service';
import { confirmVacancy, closeVacancy, getVacancyConfirmationRecordsForProperty } from '@/server/vacancy-confirmation/service';
import { queueImportantWhatsAppNotification } from '@/server/whatsapp/service';
import { readConversationStore, writeConversationStore } from './store';

function nowIso(): string { return new Date().toISOString(); }

/**
 * Start a daily vacancy confirmation conversation for a property.
 * Sends the initial prompt to the property manager (or owner if no PM).
 */
export async function startVacancyConfirmationConversation(input: {
  propertyId: string;
  propertyCategory: 'houses' | 'shops' | 'offices';
  propertyName: string;
  unitIdentifiers: string[];
  propertyManagerUserId?: string;
  propertyManagerPhone?: string;
  propertyManagerName?: string;
  propertyOwnerUserId?: string;
  propertyOwnerPhone?: string;
}): Promise<WhatsAppVacancyConversation | null> {
  if (isQuietHours()) return null;

  const recipientUserId = input.propertyManagerUserId || input.propertyOwnerUserId;
  const recipientPhone = input.propertyManagerPhone || input.propertyOwnerPhone;
  const recipientRole = input.propertyManagerUserId ? 'property-manager' as const : 'property-owner' as const;

  if (!recipientUserId || !recipientPhone) return null;

  const store = await readConversationStore();

  // Check message frequency
  const today = new Date().toISOString().split('T')[0];
  const recentMessages = store.conversations.filter(
    (c) =>
      c.currentRecipientUserId === recipientUserId &&
      c.lastMessageAt.startsWith(today),
  );
  if (recentMessages.length >= ESCALATION_RULES.maxMessagesPerDay) return null;

  const greeting = getSmartGreeting('en');
  const template = VACANCY_CONFIRMATION_TEMPLATES.initialPrompt.en(
    input.propertyName,
    input.unitIdentifiers,
  );
  const messageText = `${greeting} ${input.propertyManagerName || ''}\n\n${template}`.trim();

  const conversation: WhatsAppVacancyConversation = {
    id: randomUUID(),
    propertyId: input.propertyId,
    propertyCategory: input.propertyCategory,
    propertyName: input.propertyName,
    unitIdentifiers: input.unitIdentifiers,
    currentRecipientUserId: recipientUserId,
    currentRecipientRole: recipientRole,
    currentRecipientPhone: recipientPhone,
    originalPropertyManagerUserId: input.propertyManagerUserId,
    originalPropertyManagerPhone: input.propertyManagerPhone,
    propertyOwnerUserId: input.propertyOwnerUserId,
    propertyOwnerPhone: input.propertyOwnerPhone,
    conversationType: 'daily-vacancy-confirmation',
    state: 'awaiting-vacancy-response',
    messageHistory: [],
    confirmedVacantUnits: [],
    confirmedOccupiedUnits: [],
    escalationLevel: 0,
    daysSinceLastResponse: 0,
    createdAt: nowIso(),
    lastMessageAt: nowIso(),
  };

  // Send via WhatsApp
  await sendWhatsAppMessage(conversation, messageText);

  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: messageText,
    language: 'en',
    timestamp: nowIso(),
  });

  store.conversations.push(conversation);
  await writeConversationStore(store);
  return conversation;
}

/**
 * Process an incoming WhatsApp message reply.
 * Parses with AI, updates vacancies, sends appropriate response.
 */
export async function processIncomingMessage(
  senderPhone: string,
  messageText: string,
): Promise<{ conversationId: string; reply: string } | null> {
  const store = await readConversationStore();

  // Find the active conversation for this phone number
  const conversation = store.conversations.find(
    (c) =>
      c.currentRecipientPhone === senderPhone &&
      c.state !== 'completed' &&
      c.state !== 'idle',
  );

  if (!conversation) return null;

  // Parse the message with AI
  const parseContext: ParseContext = {
    propertyCategory: conversation.propertyCategory,
    propertyName: conversation.propertyName,
    unitIdentifiers: conversation.unitIdentifiers,
    conversationType: conversation.conversationType,
  };

  const parsed = await parseVacancyResponse(messageText, parseContext);

  // Record the inbound message
  const inboundMessage: ConversationMessage = {
    id: randomUUID(),
    direction: 'inbound',
    senderRole: conversation.currentRecipientRole,
    content: messageText,
    language: parsed.detectedLanguage,
    timestamp: nowIso(),
    parsedResult: {
      action: parsed.action,
      vacantUnits: parsed.vacantUnits,
      occupiedUnits: parsed.occupiedUnits,
      confidence: parsed.confidence,
      rawInput: parsed.rawInput,
    },
  };

  conversation.messageHistory.push(inboundMessage);
  conversation.lastResponseAt = nowIso();
  conversation.lastMessageAt = nowIso();

  let reply = '';
  let newState: ConversationState = 'completed';

  switch (parsed.action) {
    case 'all-vacant': {
      // Confirm all units as vacant
      for (const unit of conversation.unitIdentifiers) {
        const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
        const record = records.find((r) => r.unitIdentifier === unit);
        if (record) await confirmVacancy(record.id);
      }
      conversation.confirmedVacantUnits = [...conversation.unitIdentifiers];
      conversation.confirmedOccupiedUnits = [];
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
        conversation.unitIdentifiers.length,
        0,
      );
      newState = 'completed';
      break;
    }

    case 'all-occupied': {
      // Mark all units as occupied
      for (const unit of conversation.unitIdentifiers) {
        const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
        const record = records.find((r) => r.unitIdentifier === unit);
        if (record) await closeVacancy(record.id);
      }
      conversation.confirmedVacantUnits = [];
      conversation.confirmedOccupiedUnits = [...conversation.unitIdentifiers];
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
        0,
        conversation.unitIdentifiers.length,
      );
      newState = 'completed';
      break;
    }

    case 'partial-vacant': {
      if (parsed.vacantUnits.length > 0) {
        // Confirm vacant units, close occupied ones
        for (const unit of parsed.vacantUnits) {
          const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
          const record = records.find((r) => r.unitIdentifier === unit);
          if (record) await confirmVacancy(record.id);
        }
        for (const unit of parsed.occupiedUnits) {
          const records = await getVacancyConfirmationRecordsForProperty(conversation.propertyId);
          const record = records.find((r) => r.unitIdentifier === unit);
          if (record) await closeVacancy(record.id);
        }
        conversation.confirmedVacantUnits = parsed.vacantUnits;
        conversation.confirmedOccupiedUnits = parsed.occupiedUnits;
        reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.confirmationSuccess.en(
          parsed.vacantUnits.length,
          parsed.occupiedUnits.length,
        );
        newState = 'completed';
      } else {
        // Need clarification on which units
        newState = 'awaiting-partial-specification';
        reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.partialClarification.en(
          conversation.unitIdentifiers,
        );
      }
      break;
    }

    case 'add-new-vacancy': {
      reply = parsed.suggestedReply || 'Tell me more about the new vacancy. What type is it and where is it located?';
      newState = 'awaiting-vacancy-response';
      break;
    }

    case 'unclear':
    default: {
      newState = 'awaiting-vacancy-response';
      reply = parsed.suggestedReply || VACANCY_CONFIRMATION_TEMPLATES.partialClarification.en(
        conversation.unitIdentifiers,
      );
      break;
    }
  }

  // Update conversation state
  conversation.state = newState;
  if (newState === 'completed') {
    conversation.completedAt = nowIso();
  }

  // Send reply
  await sendWhatsAppMessage(conversation, reply);

  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: reply,
    language: parsed.detectedLanguage,
    timestamp: nowIso(),
  });

  // Update store
  const index = store.conversations.findIndex((c) => c.id === conversation.id);
  if (index >= 0) store.conversations[index] = conversation;
  await writeConversationStore(store);

  return { conversationId: conversation.id, reply };
}

/**
 * Check for conversations that need owner escalation.
 * Called daily — after 2 days of PM non-response, owner gets notified.
 */
export async function checkAndEscalateToOwner(): Promise<number> {
  const store = await readConversationStore();
  const now = Date.now();
  let escalated = 0;

  for (const conversation of store.conversations) {
    if (
      conversation.state === 'awaiting-vacancy-response' &&
      conversation.currentRecipientRole === 'property-manager' &&
      conversation.propertyOwnerUserId &&
      conversation.propertyOwnerPhone &&
      conversation.escalationLevel === 0
    ) {
      const lastResponse = conversation.lastResponseAt
        ? new Date(conversation.lastResponseAt).getTime()
        : new Date(conversation.createdAt).getTime();
      const daysSince = Math.floor((now - lastResponse) / (24 * 60 * 60 * 1000));

      if (daysSince >= ESCALATION_RULES.ownerNotificationAfterDays && !isQuietHours()) {
        // Escalate to owner
        const greeting = getSmartGreeting('en');
        const template = VACANCY_CONFIRMATION_TEMPLATES.ownerEscalation.en(
          conversation.propertyName,
          daysSince,
          'your property manager',
        );
        const messageText = `${greeting}\n\n${template}`;

        // Create a new conversation for the owner
        const ownerConversation: WhatsAppVacancyConversation = {
          ...conversation,
          id: randomUUID(),
          currentRecipientUserId: conversation.propertyOwnerUserId,
          currentRecipientRole: 'property-owner',
          currentRecipientPhone: conversation.propertyOwnerPhone,
          conversationType: 'owner-escalation',
          state: 'escalated-to-owner',
          escalationLevel: 1,
          escalationTriggeredAt: nowIso(),
          daysSinceLastResponse: daysSince,
          messageHistory: [],
          createdAt: nowIso(),
          lastMessageAt: nowIso(),
        };

        await sendWhatsAppMessage(ownerConversation, messageText);
        ownerConversation.messageHistory.push({
          id: randomUUID(),
          direction: 'outbound',
          senderRole: 'system',
          content: messageText,
          language: 'en',
          timestamp: nowIso(),
        });

        // Update original conversation
        conversation.escalationLevel = 1;
        conversation.escalationTriggeredAt = nowIso();
        conversation.daysSinceLastResponse = daysSince;

        store.conversations.push(ownerConversation);
        escalated++;
      }
    }
  }

  if (escalated > 0) await writeConversationStore(store);
  return escalated;
}

/**
 * Send dormant outreach to property managers with no active vacancies.
 * Called weekly.
 */
export async function sendDormantOutreach(input: {
  userId: string;
  phone: string;
  name: string;
}): Promise<boolean> {
  if (isQuietHours()) return false;

  const store = await readConversationStore();
  const today = new Date().toISOString().split('T')[0];

  // Check if we already messaged this person recently
  const recentOutreach = store.conversations.find(
    (c) =>
      c.currentRecipientUserId === input.userId &&
      c.conversationType === 'weekly-dormant-outreach' &&
      c.createdAt.startsWith(today),
  );
  if (recentOutreach) return false;

  const greeting = getSmartGreeting('en');
  const template = VACANCY_CONFIRMATION_TEMPLATES.dormantOutreach.en(input.name);
  const messageText = `${greeting} ${input.name}\n\n${template}`;

  const conversation: WhatsAppVacancyConversation = {
    id: randomUUID(),
    propertyId: '',
    propertyCategory: 'houses',
    propertyName: '',
    unitIdentifiers: [],
    currentRecipientUserId: input.userId,
    currentRecipientRole: 'property-manager',
    currentRecipientPhone: input.phone,
    conversationType: 'weekly-dormant-outreach',
    state: 'dormant-outreach-sent',
    messageHistory: [],
    confirmedVacantUnits: [],
    confirmedOccupiedUnits: [],
    escalationLevel: 0,
    daysSinceLastResponse: 0,
    createdAt: nowIso(),
    lastMessageAt: nowIso(),
  };

  await sendWhatsAppMessage(conversation, messageText);
  conversation.messageHistory.push({
    id: randomUUID(),
    direction: 'outbound',
    senderRole: 'system',
    content: messageText,
    language: 'en',
    timestamp: nowIso(),
  });

  store.conversations.push(conversation);
  await writeConversationStore(store);
  return true;
}

/** Send a WhatsApp message */
async function sendWhatsAppMessage(
  conversation: WhatsAppVacancyConversation,
  message: string,
): Promise<void> {
  try {
    await queueImportantWhatsAppNotification({
      recipientUserId: conversation.currentRecipientUserId,
      recipientRole: conversation.currentRecipientRole === 'property-manager'
        ? 'property-manager'
        : 'property-owner',
      eventType: 'daily-vacancy-confirmation-reminder',
      destinationPhoneNumber: conversation.currentRecipientPhone,
      title: 'PataSpace Vacancy',
      shortDescription: message,
      idempotencyKey: randomUUID(),
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}
