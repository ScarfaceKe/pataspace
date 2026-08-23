import { MixedUseBuildingRegistrationForm } from '@/components/mixed-use-buildings/MixedUseBuildingRegistrationForm';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Mixed-Use Building Registration — PataSpace' };

export default async function MixedUseBuildingRegistrationPage() {
  const profile = await requireCurrentUser('/properties/register/mixed-use-building');

  if (profile.role === 'customer') {
    return (
      <main className="property-registration-page">
        <section className="property-registration-card">
          <div className="auth-header">
            <span className="section-eyebrow">Not available</span>
            <h1>Customers cannot register properties</h1>
            <p>Only Property Owners, Property Managers, and Leasing Agents can register properties.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-registration-page">
      <MixedUseBuildingRegistrationForm profileRole={profile.role} />
    </main>
  );
}
