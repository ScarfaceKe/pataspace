import { CUSTOMER_HOME_SCREEN_STANDARD } from '@/domain/customer-home';
import type { AuthProfileFoundation } from '@/domain/auth';

export function CustomerHomeStart({ profile }: { profile: AuthProfileFoundation }) {
  return (
    <main className="property-registration-page customer-home-app-shell">
      <section className="property-registration-card customer-start-card" aria-labelledby="customer-home-title">
        <div className="auth-header customer-start-header">
          <span className="section-eyebrow">Welcome, {profile.fullName}</span>
          <h1 id="customer-home-title">{CUSTOMER_HOME_SCREEN_STANDARD.signedInCustomerFirstScreenQuestion}</h1>
          <p>Choose one path to start. PataSpace will guide you through relevant questions before showing matching spaces.</p>
        </div>
        <div className="property-category-grid customer-choice-grid" aria-label="Customer property search choices">
          {CUSTOMER_HOME_SCREEN_STANDARD.entryChoices.map((choice) => (
            <a key={choice.category} className="property-category-card customer-choice-card" href={choice.href}>
              <strong>{choice.label}</strong>
              <small>Start the guided match workflow with relevant filters and Search Description.</small>
            </a>
          ))}
        </div>
        <div className="customer-dashboard-strip" aria-label="Dashboard shortcuts">
          <a className="secondary-action" href="/dashboard/customer">Open My Dashboard</a>
          <a className="secondary-action" href="/dashboard/notifications">Notifications</a>
          <a className="secondary-action" href="/dashboard/viewings">Viewing Requests</a>
        </div>
      </section>
    </main>
  );
}
