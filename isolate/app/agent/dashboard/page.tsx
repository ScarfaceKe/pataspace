import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Leasing Agent Dashboard — PataSpace' };

export default async function AgentDashboardPage() {
  const profile = await requireCurrentUser('/agent/dashboard');
  return <DashboardShell profile={profile} title="Leasing Agent Dashboard" />;
}
