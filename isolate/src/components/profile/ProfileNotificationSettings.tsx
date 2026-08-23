'use client';

import { useEffect, useState } from 'react';
import type { AuthProfileFoundation } from '@/domain/auth';

interface Preferences {
  primaryPhoneNumber: string;
  whatsappSameAsPrimary: boolean;
  whatsappPhoneNumber?: string;
  inAppNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
}

interface ProfileImageState { id: string; signedUrl?: string; fileName?: string }

export function ProfileNotificationSettings({ profile }: { profile: AuthProfileFoundation }) {
  const [preferences, setPreferences] = useState<Preferences>({ primaryPhoneNumber: profile.phoneNumber, whatsappSameAsPrimary: true, inAppNotificationsEnabled: true, whatsappNotificationsEnabled: true });
  const [profileImage, setProfileImage] = useState<ProfileImageState | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch('/api/profile/notification-settings').then((response) => response.json()).then((data) => { if (data.preferences) setPreferences(data.preferences); }).catch(() => setMessage('Could not load notification settings right now.'));
    fetch('/api/storage/profile-image').then((response) => response.json()).then((data) => { if (data.file) setProfileImage(data.file); }).catch(() => undefined);
  }, []);

  async function uploadProfilePhoto() {
    if (!imageFile) { setMessage('Choose a profile image first.'); return; }
    setUploadingImage(true);
    setMessage('Uploading profile photo...');
    const form = new FormData();
    form.append('file', imageFile);
    const response = await fetch('/api/storage/profile-image', { method: 'POST', body: form });
    const result = await response.json();
    setUploadingImage(false);
    if (!response.ok) { setMessage(result.message ?? 'Profile image upload failed.'); return; }
    setProfileImage(result.file);
    setImageFile(null);
    setMessage('Profile photo uploaded successfully.');
  }

  async function deleteProfilePhoto() {
    if (!profileImage?.id) return;
    setUploadingImage(true);
    setMessage('Deleting profile photo...');
    const response = await fetch(`/api/storage/profile-image/${profileImage.id}`, { method: 'DELETE' });
    const result = await response.json();
    setUploadingImage(false);
    if (!response.ok) { setMessage(result.message ?? 'Profile image deletion failed.'); return; }
    setProfileImage(null);
    setMessage('Profile photo deleted.');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('Saving notification settings...');
    const response = await fetch('/api/profile/notification-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preferences) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.message ?? 'Could not save notification settings.'); return; }
    setPreferences(result.preferences);
    setMessage('Notification settings saved.');
  }

  return (
    <form className="auth-card compact" onSubmit={save} noValidate>
      <div className="auth-header"><span className="section-eyebrow">Profile Settings</span><h1>Profile and notification settings</h1><p>Manage your profile photo, in-app notifications, and important WhatsApp notifications.</p></div>
      <section className="profile-photo-panel" aria-label="Profile photo settings">
        <h2>Profile Photo</h2>
        {profileImage?.signedUrl ? <img className="profile-photo-preview" src={profileImage.signedUrl} alt="Current profile" /> : <div className="profile-photo-placeholder">No profile photo uploaded</div>}
        <label className="field-label">Choose from gallery or camera<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label>
        <div className="dashboard-actions">
          <button type="button" className="secondary-action" onClick={uploadProfilePhoto} disabled={uploadingImage}>{uploadingImage ? 'Uploading...' : 'Upload / Replace Photo'}</button>
          {profileImage ? <button type="button" className="text-button" onClick={deleteProfilePhoto} disabled={uploadingImage}>Delete photo</button> : null}
        </div>
      </section>
      <label className="field-label">Primary Phone Number<input value={preferences.primaryPhoneNumber} readOnly /></label>
      <label className="large-checkbox-option"><input type="checkbox" checked={!preferences.whatsappSameAsPrimary} onChange={(event) => setPreferences((current) => ({ ...current, whatsappSameAsPrimary: !event.target.checked }))} /><span>I use a different WhatsApp number</span></label>
      {!preferences.whatsappSameAsPrimary ? <label className="field-label whatsapp-number-reveal">WhatsApp Number<input value={preferences.whatsappPhoneNumber ?? ''} onChange={(event) => setPreferences((current) => ({ ...current, whatsappPhoneNumber: event.target.value }))} inputMode="tel" placeholder="0712345678" /></label> : null}
      <label className="large-checkbox-option"><input type="checkbox" checked={preferences.inAppNotificationsEnabled} onChange={(event) => setPreferences((current) => ({ ...current, inAppNotificationsEnabled: event.target.checked }))} /><span>In-App Notifications</span></label>
      <label className="large-checkbox-option"><input type="checkbox" checked={preferences.whatsappNotificationsEnabled} onChange={(event) => setPreferences((current) => ({ ...current, whatsappNotificationsEnabled: event.target.checked }))} /><span>WhatsApp Notifications</span></label>
      <button className="primary-action full-width" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
      {message ? <div className="auth-message" role="status" aria-live="polite">{message}</div> : null}
    </form>
  );
}
