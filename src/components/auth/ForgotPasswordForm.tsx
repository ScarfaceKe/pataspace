'use client';

import { useState } from 'react';

export function ForgotPasswordForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('PataSpace Support AI will help verify account ownership before allowing a password reset. It will never reveal or retrieve your existing password.');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function requestReset() {
    setRequesting(true); setErrors({}); setMessage('Support AI is reviewing your account details...');
    const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber, fullName }) });
    const result = await response.json(); setRequesting(false);
    if (!response.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message); return; }
    setMessage(result.resetToken ? `${result.message} Development reset token: ${result.resetToken}` : result.message);
  }

  async function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setResetting(true); setErrors({}); setMessage('Resetting your password securely...');
    const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber, token, password, confirmPassword }) });
    const result = await response.json(); setResetting(false);
    if (!response.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message ?? 'Please check the reset details and try again.'); return; }
    setMessage(result.message);
  }

  return (
    <form className="auth-card compact kenya-auth-card" onSubmit={submitReset} noValidate data-draft-key="support-ai-reset">
      <div className="auth-header"><span className="section-eyebrow">PataSpace Support AI</span><h1>Password recovery</h1><p>Support AI verifies account ownership using information already stored in your account. It cannot see or recover your old password.</p></div>
      <label className="field-label">Kenyan Phone Number<input name="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712345678" />{errors.phoneNumber ? <span>{errors.phoneNumber}</span> : null}</label>
      <label className="field-label">Full Name used on the account<input name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" /></label>
      <button type="button" className="secondary-action full-width" onClick={requestReset} disabled={requesting}>{requesting ? 'Support AI is checking...' : 'Ask Support AI to verify me'}</button>
      <label className="field-label">Reset Token<input name="token" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="one-time-code" />{errors.token ? <span>{errors.token}</span> : null}</label>
      <label className="field-label">New Password<input name="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} data-no-draft />{errors.password ? <span>{errors.password}</span> : null}</label>
      <label className="field-label">Confirm New Password<input name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? 'text' : 'password'} data-no-draft />{errors.confirmPassword ? <span>{errors.confirmPassword}</span> : null}</label>
      <button type="button" className="text-button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? '🙈 Hide Password' : '👁 Show Password'}</button>
      <button type="submit" className="primary-action full-width" disabled={resetting}>{resetting ? 'Resetting...' : 'Reset password'}</button>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
      <p className="auth-footer"><a href="/auth/login">Back to login</a></p>
    </form>
  );
}
