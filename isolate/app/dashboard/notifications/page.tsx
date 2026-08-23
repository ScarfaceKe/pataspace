import { requireCurrentUser } from '@/server/auth/current-user';
import { listNotifications } from '@/server/notifications/service';

export const metadata = { title: 'Notifications — PataSpace' };

export default async function NotificationsPage() {
  const profile = await requireCurrentUser();
  const notifications = await listNotifications(profile.userId);
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <span className="badge">Notification Centre</span>
        <h1>Notifications</h1>
        <p>Your important PataSpace updates appear here. Unread notifications are marked clearly.</p>
        <div className="role-list">
          {notifications.map((notification) => (
            <article key={notification.id} className={notification.status === 'unread' ? 'notification-unread' : undefined}>
              <h3>{notification.title}</h3>
              <p>{notification.shortDescription}</p>
              <p>{notification.related.unitIdentifier ? `Unit: ${notification.related.unitIdentifier}` : 'No unit linked'} · {new Date(notification.createdAt).toLocaleString()}</p>
              <span className="badge">{notification.status}</span>
            </article>
          ))}
          {!notifications.length ? <article><h3>No notifications yet</h3><p>Important account and property updates will appear here.</p></article> : null}
        </div>
      </section>
    </main>
  );
}
