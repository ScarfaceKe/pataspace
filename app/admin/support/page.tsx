import { AdminSupportTickets } from '@/components/support/AdminSupportTickets';
import { requireCurrentUser } from '@/server/auth/current-user';
import { listSupportTickets } from '@/server/support/service';
export const metadata = { title: 'Support Tickets — PataSpace Admin' };
export default async function AdminSupportPage() {
  await requireCurrentUser('/admin/dashboard');
  const tickets = await listSupportTickets();
  return <main className="dashboard-page"><AdminSupportTickets initialTickets={tickets} /></main>;
}
