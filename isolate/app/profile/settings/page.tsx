import { ProfileNotificationSettings } from '@/components/profile/ProfileNotificationSettings';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Profile Settings — PataSpace' };

export default async function ProfileSettingsPage() {
  const profile = await requireCurrentUser();
  return <main className="auth-page"><ProfileNotificationSettings profile={profile} /></main>;
}
