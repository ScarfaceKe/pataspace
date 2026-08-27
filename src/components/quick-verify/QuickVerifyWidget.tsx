'use client';

import { useState, useEffect, useCallback } from 'react';

interface VacancyRecord {
  id: string;
  unitIdentifier: string;
  category: string;
  status: string;
  activeUntil: string;
  visibleInCustomerSearch: boolean;
}

interface QuickVerifyProps {
  propertyId: string;
  propertyName: string;
}

export function QuickVerifyWidget({ propertyId, propertyName }: QuickVerifyProps) {
  const [records, setRecords] = useState<VacancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [unitStates, setUnitStates] = useState<Record<string, 'vacant' | 'occupied'>>({});

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch(`/api/quick-verify?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success) {
          setRecords(data.records);
          // Initialize all as vacant (default)
          const states: Record<string, 'vacant' | 'occupied'> = {};
          data.records.forEach((r: VacancyRecord) => {
            states[r.unitIdentifier] = 'vacant';
          });
          setUnitStates(states);
        }
      } catch {
        setResult('Failed to load units. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [propertyId]);

  const toggleUnit = useCallback((unitId: string) => {
    setUnitStates((prev) => ({
      ...prev,
      [unitId]: prev[unitId] === 'vacant' ? 'occupied' : 'vacant',
    }));
  }, []);

  const markAllVacant = useCallback(() => {
    const allVacant: Record<string, 'vacant' | 'occupied'> = {};
    records.forEach((r) => { allVacant[r.unitIdentifier] = 'vacant'; });
    setUnitStates(allVacant);
  }, [records]);

  const markAllOccupied = useCallback(() => {
    const allOccupied: Record<string, 'vacant' | 'occupied'> = {};
    records.forEach((r) => { allOccupied[r.unitIdentifier] = 'occupied'; });
    setUnitStates(allOccupied);
  }, [records]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const updates = records.map((r) => ({
        unitId: r.unitIdentifier,
        action: unitStates[r.unitIdentifier] === 'vacant' ? 'confirm' as const : 'close' as const,
      }));

      const res = await fetch('/api/quick-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, updates }),
      });
      const data = await res.json();
      setResult(data.message || 'Updated!');
    } catch {
      setResult('Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [records, unitStates, propertyId]);

  if (loading) {
    return (
      <div className="qv-container">
        <div className="qv-loading">
          <div className="qv-spinner" />
          <p>Loading your units...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="qv-container">
        <div className="qv-success">
          <div className="qv-success-icon">✓</div>
          <h2>{result}</h2>
          <p>Your listings have been updated on PataSpace.</p>
        </div>
      </div>
    );
  }

  const vacantCount = Object.values(unitStates).filter((s) => s === 'vacant').length;
  const occupiedCount = Object.values(unitStates).filter((s) => s === 'occupied').length;

  return (
    <div className="qv-container">
      <div className="qv-header">
        <div className="qv-brand">P</div>
        <h1>Quick Verify</h1>
        <p className="qv-property-name">{propertyName}</p>
        <p className="qv-summary">
          {vacantCount} vacant · {occupiedCount} occupied
        </p>
      </div>

      <div className="qv-actions-bar">
        <button onClick={markAllVacant} className="qv-action-btn qv-action-all-vacant">
          All vacant
        </button>
        <button onClick={markAllOccupied} className="qv-action-btn qv-action-all-occupied">
          All occupied
        </button>
      </div>

      <div className="qv-units-list">
        {records.map((record) => {
          const isVacant = unitStates[record.unitIdentifier] === 'vacant';
          return (
            <button
              key={record.id}
              className={`qv-unit-card ${isVacant ? 'qv-unit-vacant' : 'qv-unit-occupied'}`}
              onClick={() => toggleUnit(record.unitIdentifier)}
            >
              <div className="qv-unit-indicator">
                <div className={`qv-unit-dot ${isVacant ? 'dot-vacant' : 'dot-occupied'}`} />
              </div>
              <div className="qv-unit-info">
                <span className="qv-unit-id">{record.unitIdentifier}</span>
                <span className="qv-unit-category">{record.category}</span>
              </div>
              <div className="qv-unit-status">
                {isVacant ? 'Vacant ✓' : 'Occupied ✗'}
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="qv-submit-btn"
        onClick={submit}
        disabled={submitting}
      >
        {submitting ? 'Updating...' : 'Confirm & Update'}
      </button>

      <p className="qv-footer-note">
        Tap each unit to toggle between vacant and occupied, then confirm.
      </p>
    </div>
  );
}
