import { CustomerHomeStart } from '@/components/CustomerHomeStart';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Customer Home — PataSpace' };

export default async function CustomerHomePage() {
  const profile = await requireCurrentUser('/customer/home');
  return <CustomerHomeStart profile={profile} />;
}
