import { NextResponse } from 'next/server';
import { readConversationStore } from '@/server/whatsapp-conversation/store';
import { requireCurrentUser } from '@/server/auth/current-user';

/**
 * GET /api/whatsapp/conversations
 * 
 * Fetch WhatsApp vacancy conversations for the current user.
 * Returns conversations where the user is the recipient or the property owner.
 */
export async function GET() {
  try {
    const user = await requireCurrentUser('/manager/dashboard');
    const store = await readConversationStore();

    // Filter conversations relevant to this user
    const relevantConversations = store.conversations.filter(
      (c) =>
        c.currentRecipientUserId === user.userId ||
        c.propertyOwnerUserId === user.userId ||
        c.originalPropertyManagerUserId === user.userId,
    );

    // Sort by most recent first
    relevantConversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );

    return NextResponse.json({
      success: true,
      conversations: relevantConversations.map((c) => ({
        id: c.id,
        propertyName: c.propertyName,
        unitIdentifiers: c.unitIdentifiers,
        state: c.state,
        conversationType: c.conversationType,
        lastMessageAt: c.lastMessageAt,
        confirmedVacantUnits: c.confirmedVacantUnits,
        confirmedOccupiedUnits: c.confirmedOccupiedUnits,
        escalationLevel: c.escalationLevel,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 },
    );
  }
}
