'use client';

import { useState } from 'react';

export function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [shortSummary, setShortSummary] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('Creating your support ticket...');
    const response = await fetch('/api/support/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, shortSummary, detailedDescription }) });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) { setMessage(result.message ?? 'Support ticket could not be created.'); return; }
    setMessage(result.ticket.ai_acknowledgement || 'Support ticket created.');
    setSubject(''); setShortSummary(''); setDetailedDescription('');
  }

  return (
    <form className="auth-card compact" onSubmit={submit} noValidate>
      <div className="auth-header"><span className="section-eyebrow">Contact Support</span><h1>PataSpace Support</h1><p>Tell us what happened. Support AI will acknowledge your issue and create a ticket for the team.</p></div>
      <label className="field-label">Subject<input value={subject} onChange={(e)=>setSubject(e.target.value)} /></label>
      <label className="field-label">Short problem summary<input value={shortSummary} onChange={(e)=>setShortSummary(e.target.value)} /></label>
      <label className="field-label">Detailed description<textarea className="large-description-field" rows={6} value={detailedDescription} onChange={(e)=>setDetailedDescription(e.target.value)} /></label>
      <button className="primary-action full-width" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit support ticket'}</button>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </form>
  );
}
