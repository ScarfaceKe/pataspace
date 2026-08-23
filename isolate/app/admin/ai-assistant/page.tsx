import { requireCurrentUser } from '@/server/auth/current-user';
import { listAiAdminRecommendations, runAiAdminFoundationScan } from '@/server/ai-admin/service';

export const metadata = { title: 'AI Admin Assistant — PataSpace' };

export default async function AiAdminAssistantPage() {
  await requireCurrentUser('/admin/dashboard');
  await runAiAdminFoundationScan();
  const recommendations = await listAiAdminRecommendations();
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Internal only</span>
        <h1>AI Admin Assistant</h1>
        <p>The AI Admin Assistant quietly supports administrators. It is invisible to customers and never makes final decisions independently.</p>
        <div className="role-list">
          {recommendations.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.clearExplanation}</p>
              <p><strong>Reason:</strong> {item.reason}</p>
              <p><strong>Suggested action:</strong> {item.suggestedAction}</p>
              <span className="badge">{item.priority} · {item.status}</span>
            </article>
          ))}
          {!recommendations.length ? <article><h3>No recommendations yet</h3><p>Operational recommendations will appear here.</p></article> : null}
        </div>
      </section>
    </main>
  );
}
