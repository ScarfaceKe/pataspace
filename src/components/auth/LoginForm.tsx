'use client';

import { useState } from 'react';
import { startSupabaseGoogleOAuth } from './supabaseGoogleSignIn';

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);


  async function submitGoogleLogin() {
    setSubmitting(true);
    setErrors({});
    setMessage('Opening Google Sign-In...');
    try {
      await startSupabaseGoogleOAuth({ mode: 'login' });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google Sign-In was cancelled.');
      setSubmitting(false);
    }
  }


  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('Checking your phone number...');
    setErrors({});
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber, password, rememberMe }) });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message ?? 'We could not sign you in. Please try again.'); return; }
    setMessage('Login successful. Taking you to your dashboard...');
    window.location.href = result.dashboardRoute;
  }

  return (
    <form className="auth-card compact kenya-auth-card" onSubmit={submitLogin} noValidate data-draft-key="login">
      <div className="auth-header">
        <span className="section-eyebrow">Log in</span>
        <h1>Welcome back to PataSpace</h1>
        <p>Continue with Google or use your Kenyan phone number and password.</p>
      </div>
      <button type="button" className="secondary-action full-width google-action" onClick={submitGoogleLogin}>
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <label className="field-label">
        Kenyan Phone Number
        <input name="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712345678" />
        {errors.phoneNumber ? <span>{errors.phoneNumber}</span> : null}
      </label>
      <label className="field-label">
        Password
        <input name="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" data-no-draft />
        {errors.password ? <span>{errors.password}</span> : null}
      </label>
      <button type="button" className="text-button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? '🙈 Hide Password' : '👁 Show Password'}</button>
      <label className="inline-choice"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me on this device</label>
      <button type="submit" className="primary-action full-width" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in with Phone Number'}</button>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
      <p className="auth-footer"><a href="/auth/forgot-password">Forgot password?</a> New to PataSpace? <a href="/auth/register">Create account</a></p>
    </form>
  );
}
