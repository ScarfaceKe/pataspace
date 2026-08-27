'use client';

import { useState, useEffect, useCallback } from 'react';

interface ConversationRecord {
  id: string;
  propertyName: string;
  unitIdentifiers: string[];
  state: string;
  conversationType: string;
  lastMessageAt: string;
  confirmedVacantUnits: string[];
  confirmedOccupiedUnits: string[];
}

interface WhatsAppVacancySectionProps {
  userId: string;
}

/**
 * WhatsApp Vacancy Dashboard Section
 * 
 * Shows pending confirmations, recent conversations, and stats
 * for property managers and owners.
 */
export function WhatsAppVacancySection({ userId }: WhatsAppVacancySectionProps) {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // Silent fail — section just shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const pendingCount = conversations.filter((c) =>
    c.state === 'app-prompt-sent' || c.state === 'awaiting-vacancy-response',
  ).length;
  const completedCount = conversations.filter((c) => c.state === 'completed').length;
  const escalatedCount = conversations.filter((c) => c.state === 'escalated-to-owner').length;

  return (
    <section className="wa-section">
      <div className="wa-section-header">
        <div className="wa-section-icon">📱</div>
        <div>
          <h3 className="wa-section-title">WhatsApp Vacancy Confirmations</h3>
          <p className="wa-section-subtitle">Automated vacancy check-ins via WhatsApp</p>
        </div>
      </div>

      <div className="wa-stats-row">
        <div className="wa-stat-card">
          <span className="wa-stat-value">{pendingCount}</span>
          <span className="wa-stat-label">Pending</span>
        </div>
        <div className="wa-stat-card">
          <span className="wa-stat-value">{completedCount}</span>
          <span className="wa-stat-label">Confirmed</span>
        </div>
        <div className="wa-stat-card">
          <span className="wa-stat-value">{escalatedCount}</span>
          <span className="wa-stat-label">Escalated</span>
        </div>
      </div>

      {loading ? (
        <div className="wa-empty-state">
          <p>Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="wa-empty-state">
          <p>No WhatsApp conversations yet.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            When you list vacant properties, PataSpace will automatically send WhatsApp confirmations.
          </p>
        </div>
      ) : (
        <div className="wa-conversation-list">
          {conversations.slice(0, 10).map((conv) => (
            <div key={conv.id} className="wa-conversation-item">
              <div className={`wa-conversation-status ${
                conv.state === 'completed' ? 'wa-status-completed' :
                conv.state === 'escalated-to-owner' ? 'wa-status-escalated' :
                conv.state.includes('sent') ? 'wa-status-pending' :
                'wa-status-active'
              }`} />
              <div className="wa-conversation-info">
                <span className="wa-conversation-property">
                  {conv.propertyName || 'Unnamed Property'}
                </span>
                <span className="wa-conversation-detail">
                  {conv.unitIdentifiers.length} units · {conv.state.replace(/-/g, ' ')}
                  {conv.confirmedVacantUnits.length > 0 && ` · ${conv.confirmedVacantUnits.length} confirmed`}
                </span>
              </div>
              <span className="wa-conversation-time">
                {new Date(conv.lastMessageAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
