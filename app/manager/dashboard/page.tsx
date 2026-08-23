import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Property Manager Dashboard — PataSpace' };

export default async function ManagerDashboardPage() {
  const profile = await requireCurrentUser('/manager/dashboard');
  return <DashboardShell profile={profile} title="Property Manager Dashboard" />;
}
