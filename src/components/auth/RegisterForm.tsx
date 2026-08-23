'use client';

import { useMemo, useState } from 'react';
import { validatePassword, type PublicRegistrationRoleId } from '@/domain/auth';
import { startSupabaseGoogleOAuth } from './supabaseGoogleSignIn';
import { usePersistentMatchState } from '@/components/match/usePersistentMatchState';

type FieldErrors = Record<string, string>;
type AccountPath = 'customer' | 'business';

const BUSINESS_ROLES: { id: PublicRegistrationRoleId; icon: string; label: string; description: string }[] = [
  { id: 'property-owner', icon: '👑', label: 'Property Owner', description: 'Register and manage rental spaces you own.' },
  { id: 'property-manager', icon: '🏢', label: 'Property Manager', description: 'Manage listings, vacancies, and enquiries professionally.' },
  { id: 'leasing-agent', icon: '🤝', label: 'Leasing Agent', description: 'Support viewings, enquiries, and rental matching workflows.' }
];

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [accountPath, setAccountPath] = usePersistentMatchState<AccountPath | ''>('registration:accountPath', '');
  const [role, setRole] = usePersistentMatchState<PublicRegistrationRoleId>('registration:role', 'customer');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = usePersistentMatchState('registration:fullName', '');
  const [phoneNumber, setPhoneNumber] = usePersistentMatchState('registration:phoneNumber', '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordHints = useMemo(() => validatePassword(password), [password]);

  function choosePath(path: AccountPath) { setAccountPath(path); setRole(path === 'customer' ? 'customer' : 'property-owner'); setErrors({}); }
  function continueStep() { if (step === 1 && !accountPath) { setErrors({ role: 'Choose Customer or Business / Property Professional.' }); return; } setStep((current) => Math.min(3, current + 1)); }


  async function submitGoogleRegistration() {
    setSubmitting(true);
    setErrors({});
    setMessage('Opening Google Sign-In...');
    if (!accountPath) {
      setSubmitting(false);
      setStep(1);
      setErrors({ role: 'Choose Customer or Business / Property Professional before continuing with Google.' });
      setMessage('Choose your account type first, then continue with Google.');
      return;
    }
    if (!phoneNumber) {
      setSubmitting(false);
      setStep(2);
      setErrors({ phoneNumber: 'Enter your Kenyan phone number before continuing with Google.' });
      setMessage('Enter your phone number first, then continue with Google.');
      return;
    }
    try {
      await startSupabaseGoogleOAuth({ mode: 'register', phoneNumber, role, fullName });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google Sign-In was cancelled.');
      setSubmitting(false);
    }
  }


  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setMessage('Creating your secure PataSpace account...'); setErrors({});
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, fullName, phoneNumber, password, confirmPassword }) });
    const result = await response.json(); setSubmitting(false);
    if (!response.ok) { setErrors(result.fieldErrors ?? {}); setMessage(result.message ?? 'Please check your details and try again.'); if (result.fieldErrors?.role) setStep(1); else if (result.fieldErrors?.fullName || result.fieldErrors?.phoneNumber) setStep(2); else setStep(3); return; }
    setMessage('Your account has been created successfully. Taking you to your dashboard...'); window.location.href = result.dashboardRoute;
  }

  return (
    <form className="auth-card registration-wizard kenya-auth-card" onSubmit={submitRegistration} noValidate data-draft-key="registration">
      <div className="auth-header"><span className="section-eyebrow">Create account</span><h1>Join PataSpace quickly</h1><p>Continue with Google or use your phone number. No email verification. No SMS verification.</p></div>
      <button type="button" className="secondary-action full-width google-action" onClick={submitGoogleRegistration}>Continue with Google</button>
      <div className="auth-divider"><span>or continue with phone number</span></div>
      <div className="progress-steps wizard-progress" aria-label="Registration progress">{[1, 2, 3].map((item) => <button key={item} type="button" className={step === item ? 'step active' : 'step'} onClick={() => setStep(item)}>{item}</button>)}</div>
      {step === 1 ? <section className="auth-step"><h2>What type of account would you like?</h2><div className="role-choice-grid simplified-role-grid"><button type="button" className={accountPath === 'customer' ? 'role-choice active' : 'role-choice'} onClick={() => choosePath('customer')}><span>👤</span><strong>Customer</strong><small>Find houses, shops, offices, and event halls.</small></button><button type="button" className={accountPath === 'business' ? 'role-choice active' : 'role-choice'} onClick={() => choosePath('business')}><span>🏢</span><strong>Business / Property Professional</strong><small>List, manage, or support rental spaces professionally.</small></button></div>{accountPath === 'business' ? <div className="business-role-panel"><h3>Choose your professional role</h3><div className="role-choice-grid">{BUSINESS_ROLES.map((item) => <button key={item.id} type="button" className={role === item.id ? 'role-choice active' : 'role-choice'} onClick={() => setRole(item.id)}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.description}</small></button>)}</div></div> : null}{errors.role ? <p className="field-error">{errors.role}</p> : null}</section> : null}
      {step === 2 ? <section className="auth-step"><h2>Your details</h2><label className="field-label">Full Name<input name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" />{errors.fullName ? <span>{errors.fullName}</span> : null}</label><label className="field-label">Kenyan Phone Number<input name="phoneNumber" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0712345678" />{errors.phoneNumber ? <span>{errors.phoneNumber}</span> : null}</label><label className="large-checkbox-option"><input type="checkbox" defaultChecked /> <span>Use this number for important WhatsApp notifications</span></label></section> : null}
      {step === 3 ? <section className="auth-step"><h2>Secure your account</h2><label className="field-label">Password<input name="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" data-no-draft />{errors.password ? <span>{errors.password}</span> : null}</label><label className="field-label">Confirm Password<input name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="new-password" data-no-draft />{errors.confirmPassword ? <span>{errors.confirmPassword}</span> : null}</label><button type="button" className="text-button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? '🙈 Hide Password' : '👁 Show Password'}</button><p className="small-note">{passwordHints.length ? passwordHints.join(' ') : 'Password strength looks good.'}</p></section> : null}
      <div className="auth-actions">{step > 1 ? <button type="button" className="secondary-action" onClick={() => setStep(step - 1)}>Back</button> : null}{step < 3 ? <button type="button" className="primary-action" onClick={continueStep}>Continue</button> : <button type="submit" className="primary-action" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>}</div>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}<p className="auth-footer">Already have an account? <a href="/auth/login">Log in</a></p>
    </form>
  );
}
