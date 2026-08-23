import { HouseRegistrationForm } from '@/components/houses/HouseRegistrationForm';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'House Registration — PataSpace' };

export default async function HouseRegistrationPage() {
  const profile = await requireCurrentUser();

  if (profile.role === 'customer') {
    return (
      <main className="property-registration-page">
        <section className="property-registration-card">
          <div className="auth-header">
            <span className="section-eyebrow">Not available</span>
            <h1>Customers cannot register houses</h1>
            <p>Only Property Owners, Property Managers, and Leasing Agents can register properties.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-registration-page">
      <HouseRegistrationForm profileRole={profile.role} />
    </main>
  );
}
