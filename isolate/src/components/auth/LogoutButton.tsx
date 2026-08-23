'use client';

import { useState } from 'react';

export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState<'current' | 'all' | null>(null);

  async function logout(scope: 'current' | 'all') {
    setLoggingOut(scope);
    await fetch(scope === 'all' ? '/api/auth/logout-all' : '/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  }

  return (
    <div className="logout-actions">
      <button className="secondary-action" type="button" onClick={() => logout('current')} disabled={Boolean(loggingOut)}>
        {loggingOut === 'current' ? 'Logging out...' : 'Log out'}
      </button>
      <button className="text-button" type="button" onClick={() => logout('all')} disabled={Boolean(loggingOut)}>
        {loggingOut === 'all' ? 'Logging out everywhere...' : 'Log out all devices'}
      </button>
    </div>
  );
}
