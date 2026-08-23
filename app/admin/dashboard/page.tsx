import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Admin Dashboard — PataSpace' };

export default async function AdminDashboardPage() {
  const profile = await requireCurrentUser('/admin/dashboard');
  return <DashboardShell profile={profile} title="Admin Dashboard" />;
}
