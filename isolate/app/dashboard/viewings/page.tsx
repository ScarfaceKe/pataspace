import { requireCurrentUser } from '@/server/auth/current-user';
import { getViewingHistoryForCustomer, getViewingHistoryForResponsibleContact } from '@/server/viewings/service';
import { canRegisterProperties } from '@/domain/property-registration';

export const metadata = { title: 'Viewing History — PataSpace' };

export default async function ViewingHistoryPage() {
  const profile = await requireCurrentUser();
  const viewings = canRegisterProperties(profile.role)
    ? await getViewingHistoryForResponsibleContact(profile.userId)
    : await getViewingHistoryForCustomer(profile.userId);

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Viewing Workflow</span>
        <h1>Viewing history</h1>
        <p>Every viewing record keeps the latest status, schedule, rescheduling history and audit trail.</p>
        <div className="role-list">
          {viewings.map((viewing) => (
            <article key={viewing.id}>
              <h3>{viewing.propertyOrUnitIdentifier} · {viewing.status}</h3>
              <p>{viewing.propertyCategory} · {viewing.schedule.preferredDate} at {viewing.schedule.preferredTime}</p>
              <p>History entries: {viewing.history.length}</p>
            </article>
          ))}
          {!viewings.length ? <article><h3>No viewings yet</h3><p>Viewing requests will appear here once created.</p></article> : null}
        </div>
      </section>
    </main>
  );
}
