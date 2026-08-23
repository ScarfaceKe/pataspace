import { ShopRegistrationForm } from '@/components/shops/ShopRegistrationForm';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Shop Registration — PataSpace' };

export default async function ShopRegistrationPage() {
  const profile = await requireCurrentUser();

  if (profile.role === 'customer') {
    return (
      <main className="property-registration-page">
        <section className="property-registration-card">
          <div className="auth-header">
            <span className="section-eyebrow">Not available</span>
            <h1>Customers cannot register shops</h1>
            <p>Only Property Owners, Property Managers, and Leasing Agents can register properties.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-registration-page">
      <ShopRegistrationForm profileRole={profile.role} />
    </main>
  );
}
