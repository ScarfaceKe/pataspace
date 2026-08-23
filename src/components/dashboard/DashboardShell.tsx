import type { AuthProfileFoundation } from '@/domain/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { canRegisterProperties } from '@/domain/property-registration';
import { ListingWhatsAppSupport } from '@/components/support/ListingWhatsAppSupport';

export function DashboardShell({ profile, title }: { profile: AuthProfileFoundation; title: string }) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Signed in</span>
        <h1>{title}</h1>
        <p>
          Welcome, {profile.fullName}. Your PataSpace profile foundation is active and ready for future workflows.
        </p>
        <dl className="profile-summary">
          <div>
            <dt>Account Role</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>Email Address</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Phone Number</dt>
            <dd>{profile.phoneNumber}</dd>
          </div>
          <div>
            <dt>Account Status</dt>
            <dd>{profile.status}</dd>
          </div>
        </dl>
        {canRegisterProperties(profile.role) ? <ListingWhatsAppSupport context="dashboard" /> : null}
        <div className="dashboard-actions">
          {profile.role === 'customer' ? (
            <>
              <a className="primary-action" href="/dashboard/customer">My Dashboard</a>
              <a className="secondary-action" href="/dashboard/customer/workspace">My Workspace</a>
              <a className="secondary-action" href="/match/house">Start House Match</a>
              <a className="secondary-action" href="/match/shop">Start Shop Match</a>
              <a className="secondary-action" href="/match/office">Start Office Match</a>
              <a className="secondary-action" href="/match/event-hall">Start Hall Match</a>
            </>
          ) : null}
          {profile.role === 'platform-admin' ? (
            <>
              <a className="primary-action" href="/admin/founder">Founder Dashboard</a>
              <a className="secondary-action" href="/admin/founder/workspace">Founder Workspace</a>
              <a className="secondary-action" href="/admin/verification">Open verification queue</a>
              <a className="secondary-action" href="/admin/ai-assistant">AI Admin Assistant</a>
            <a className="secondary-action" href="/admin/ai-workspace">AI Admin Workspace</a>
            <a className="secondary-action" href="/admin/analytics">Platform Analytics</a>
            <a className="secondary-action" href="/admin/search-intelligence">Search Intelligence</a>
            <a className="secondary-action" href="/admin/geography">Geography</a>
            <a className="secondary-action" href="/admin/recommendations">Recommendation Intelligence</a>
            <a className="secondary-action" href="/admin/health">Platform Health</a>
            <a className="secondary-action" href="/admin/health/operations">Health Operations</a>
            <a className="secondary-action" href="/admin/security">Security Operations</a>
            <a className="secondary-action" href="/admin/revenue">Revenue Intelligence</a>
            <a className="secondary-action" href="/admin/executive">Executive Dashboard</a>
            <a className="secondary-action" href="/admin/executive/intelligence">Executive Intelligence</a>
            </>
          ) : null}
          {canRegisterProperties(profile.role) ? (
            <>
              <a className="primary-action" href="/properties/register/house">Register house</a>
              <a className="secondary-action" href="/dashboard/vacancy-confirmation">Confirm vacancies</a>
              <a className="secondary-action" href="/properties/register/shop">Register shop</a>
              <a className="secondary-action" href="/properties/register/office">Register office</a>
              <a className="secondary-action" href="/properties/register/event-hall">Register event hall</a>
              <a className="secondary-action" href="/properties/register/mixed-use-building">Register mixed-use building</a>
              <a className="secondary-action" href="/properties/register">Register other property</a>
            </>
          ) : null}
          <a className="secondary-action" href="/dashboard/viewings">Viewing history</a>
          <a className="secondary-action" href="/profile/settings">Profile Settings</a>
          <a className="secondary-action" href="/dashboard/notifications">Notifications</a>
          <a className="secondary-action" href="/dashboard/reviews">Reviews</a>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
