import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Owner Dashboard — PataSpace' };

export default async function OwnerDashboardPage() {
  const profile = await requireCurrentUser('/owner/dashboard');
  return <DashboardShell profile={profile} title="Owner Dashboard" />;
}
