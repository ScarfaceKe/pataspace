'use client';

import { useState } from 'react';

export function AdminSupportTickets({ initialTickets }: { initialTickets: any[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [message, setMessage] = useState('');

  async function updateTicket(ticketId: string, formData: FormData) {
    setMessage('Updating support ticket...');
    const response = await fetch('/api/support/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId,
        status: formData.get('status'),
        founderReply: formData.get('founderReply')
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.message ?? 'Ticket update failed.');
      return;
    }
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? result.ticket : ticket));
    setMessage('Support ticket updated.');
  }

  return (
    <section className="dashboard-card">
      <span className="badge">Founder/Admin</span>
      <h1>Support Tickets</h1>
      <p>Review customer support tickets, update status, and add Founder/Admin replies.</p>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
      <div className="cards-grid support-ticket-grid">
        {tickets.map((ticket) => (
          <article className="info-card support-ticket-card" key={ticket.id}>
            <span className="badge">{ticket.status}</span>
            <h3>{ticket.subject}</h3>
            <p>{ticket.short_summary}</p>
            <p><strong>Details:</strong> {ticket.detailed_description}</p>
            <p><strong>AI Support:</strong> {ticket.ai_acknowledgement}</p>
            <p>Priority: {ticket.priority}</p>
            {ticket.founder_reply ? <p><strong>Founder/Admin Reply:</strong> {ticket.founder_reply}</p> : null}
            <form action={(formData) => updateTicket(ticket.id, formData)} className="support-reply-form">
              <label className="field-label">Status
                <select name="status" defaultValue={ticket.status}>
                  <option value="open">Open</option>
                  <option value="in-review">In Review</option>
                  <option value="awaiting-user">Awaiting User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="field-label">Founder/Admin Reply
                <textarea name="founderReply" className="large-description-field" rows={4} defaultValue={ticket.founder_reply ?? ''} />
              </label>
              <button className="secondary-action" type="submit">Save reply</button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
