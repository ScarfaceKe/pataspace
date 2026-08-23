import { EventHallRegistrationForm } from '@/components/event-halls/EventHallRegistrationForm';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Event Hall Registration — PataSpace' };

export default async function EventHallRegistrationPage() {
  const profile = await requireCurrentUser();

  if (profile.role === 'customer') {
    return (
      <main className="property-registration-page">
        <section className="property-registration-card">
          <div className="auth-header">
            <span className="section-eyebrow">Not available</span>
            <h1>Customers cannot register event halls</h1>
            <p>Only Property Owners, Property Managers, and Leasing Agents can register properties.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-registration-page">
      <EventHallRegistrationForm profileRole={profile.role} />
    </main>
  );
}
