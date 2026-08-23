import { query } from '@/server/database/client';

export interface SupportTicketInput {
  submittedBy?: string;
  subject: string;
  shortSummary: string;
  detailedDescription: string;
}

function buildAiAcknowledgement(input: SupportTicketInput): string {
  const text = `${input.subject} ${input.shortSummary} ${input.detailedDescription}`.toLowerCase();
  if (text.includes('registration') || text.includes('login') || text.includes('password')) {
    return `Thanks for explaining the account issue. I can see this relates to signing in or account access. I have created a support ticket and the team can review the account safely without ever asking for or revealing your password.`;
  }
  if (text.includes('payment') || text.includes('mpesa') || text.includes('m-pesa') || text.includes('megapay')) {
    return `Thanks for reporting the payment concern. I have created a support ticket and included your payment-related summary so the team can check transaction records and follow up carefully.`;
  }
  if (text.includes('property') || text.includes('listing') || text.includes('photo') || text.includes('vacancy')) {
    return `Thanks for describing the property issue. I have created a support ticket and highlighted that this relates to listings, photos, or vacancy workflows so the team can investigate the right area.`;
  }
  if (text.includes('search') || text.includes('match')) {
    return `Thanks for sharing the search or matching issue. I have created a support ticket and included your description so the team can review the matching experience.`;
  }
  return `Thanks for contacting PataSpace Support. I have created a support ticket with your summary and details so the team can review and reply.`;
}

function priorityFor(input: SupportTicketInput): 'low' | 'normal' | 'high' | 'critical' {
  const text = `${input.subject} ${input.shortSummary} ${input.detailedDescription}`.toLowerCase();
  if (text.includes('security') || text.includes('fraud') || text.includes('hacked')) return 'critical';
  if (text.includes('payment') || text.includes('cannot login') || text.includes('broken')) return 'high';
  return 'normal';
}

export async function createSupportTicket(input: SupportTicketInput) {
  if (!input.subject.trim() || !input.shortSummary.trim() || !input.detailedDescription.trim()) {
    return { ok: false as const, status: 400, message: 'Subject, short problem summary, and detailed description are required.' };
  }
  const aiAcknowledgement = buildAiAcknowledgement(input);
  const result = await query(
    `insert into support_tickets (submitted_by, subject, short_summary, detailed_description, ai_acknowledgement, priority)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [input.submittedBy ?? null, input.subject.trim(), input.shortSummary.trim(), input.detailedDescription.trim(), aiAcknowledgement, priorityFor(input)]
  );
  return { ok: true as const, ticket: result.rows[0] };
}

export async function listSupportTickets() {
  const result = await query('select * from support_tickets order by created_at desc limit 100');
  return result.rows;
}

export async function updateSupportTicket(input: { ticketId: string; status: string; founderReply?: string }) {
  const allowed = new Set(['open', 'in-review', 'awaiting-user', 'resolved', 'closed']);
  if (!allowed.has(input.status)) return { ok: false as const, status: 400, message: 'Choose a valid ticket status.' };
  const result = await query(
    `update support_tickets set status=$1, founder_reply=$2, updated_at=now(), resolved_at=case when $1 in ('resolved','closed') then coalesce(resolved_at, now()) else resolved_at end where id::text=$3 returning *`,
    [input.status, input.founderReply?.trim() || null, input.ticketId]
  );
  if (!result.rows[0]) return { ok: false as const, status: 404, message: 'Support ticket was not found.' };
  return { ok: true as const, ticket: result.rows[0] };
}
