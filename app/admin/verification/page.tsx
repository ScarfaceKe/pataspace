import { getVerificationQueue } from '@/server/verification/service';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Verification Queue — PataSpace' };

export default async function VerificationQueuePage() {
  await requireCurrentUser('/admin/dashboard');
  const records = await getVerificationQueue();
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Platform Admin</span>
        <h1>Property Verification Queue</h1>
        <p>AI Admin Assistant preparation is visible here for Platform Administrator review. Final verification decisions remain under Platform Administrator control.</p>
        <div className="role-list">
          {records.map((record) => (
            <article key={record.id}>
              <h3>{record.propertyCategory} · {record.status}</h3>
              <p>Property ID: {record.propertyId}</p>
              <p>Priority: {record.queuePriority}</p>
              {record.correctionHints.length ? <p>Needs attention: {record.correctionHints.join(' ')}</p> : <p>Pre-checks are ready for review.</p>}
            </article>
          ))}
          {!records.length ? <article><h3>No properties waiting yet</h3><p>New registrations will automatically appear here.</p></article> : null}
        </div>
      </section>
    </main>
  );
}
