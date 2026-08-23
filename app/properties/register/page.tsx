import { PropertyRegistrationForm } from '@/components/properties/PropertyRegistrationForm';
import { requireCurrentUser } from '@/server/auth/current-user';
import { canRegisterProperties } from '@/domain/property-registration';

export const metadata = { title: 'Register Property — PataSpace' };

export default async function PropertyRegisterPage() {
  const profile = await requireCurrentUser();

  if (!canRegisterProperties(profile.role)) {
    return (
      <main className="property-registration-page">
        <section className="property-registration-card">
          <div className="auth-header">
            <span className="section-eyebrow">Not available</span>
            <h1>Property registration is restricted</h1>
            <p>Only Property Owners, Property Managers, and Leasing Agents can register properties.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-registration-page">
      <PropertyRegistrationForm profileRole={profile.role} />
    </main>
  );
}
