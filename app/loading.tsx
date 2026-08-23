export default function Loading() {
  return (
    <main className="loading-shell" aria-busy="true" aria-live="polite">
      <section className="skeleton-card hero-skeleton">
        <div className="skeleton-line short" />
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line medium" />
        <div className="skeleton-actions">
          <div className="skeleton-pill" />
          <div className="skeleton-pill secondary" />
        </div>
      </section>
      <section className="skeleton-grid" aria-label="Loading content">
        {[0, 1, 2, 3].map((item) => (
          <div className="skeleton-card compact" key={item}>
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line" />
          </div>
        ))}
      </section>
    </main>
  );
}
