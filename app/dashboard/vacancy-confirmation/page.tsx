import { getAllVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { requireCurrentUser } from '@/server/auth/current-user';

export const metadata = { title: 'Daily Vacancy Confirmation — PataSpace' };

export default async function VacancyConfirmationPage() {
  await requireCurrentUser();
  const records = await getAllVacancyConfirmationRecords();
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Daily vacancy confirmation</span>
        <h1>Confirm vacant units</h1>
        <p>Each vacant unit is confirmed independently. Confirming one unit does not confirm any other unit.</p>
        <div className="role-list">
          {records.map((record) => (
            <article key={record.id}>
              <h3>{record.unitIdentifier} · {record.status}</h3>
              <p>{record.category} · Active until {new Date(record.activeUntil).toLocaleString()}</p>
              <p>Grace until {new Date(record.graceUntil).toLocaleString()}</p>
              <p>Search visible: {record.visibleInCustomerSearch ? 'Yes' : 'No'}</p>
            </article>
          ))}
          {!records.length ? <article><h3>No vacant units yet</h3><p>Published vacant house, shop and office units will appear here.</p></article> : null}
        </div>
      </section>
    </main>
  );
}
