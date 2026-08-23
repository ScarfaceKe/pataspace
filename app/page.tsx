import { PremiumLandingShell } from '@/components/PremiumLandingShell';
import { HeroEntryCards } from '@/components/HeroEntryCards';
import { PremiumStats } from '@/components/system/PremiumStats';
import { AmbientParticles } from '@/components/system/AmbientParticles';
import { SectionBlobs, ScrollReactiveSection } from '@/components/system/SectionBlobs';
import { FeaturedPropertiesLive, TestimonialsLive } from '@/components/LandingLiveData';
import dynamic from 'next/dynamic';
import { FEATURED_KENYA_LOCATIONS } from '@/domain/locations';
import { BRAND_IDENTITY } from '@/domain/brand';
import { PLATFORM_FOUNDATION } from '@/domain/platform';
import { PROPERTY_CATEGORIES } from '@/domain/property-categories';
import { TRUST_PRINCIPLES } from '@/domain/trust';

const GuidedSearch = dynamic(() => import('@/components/GuidedSearch').then((mod) => mod.GuidedSearch), {
  loading: () => <div className="skeleton-card hero-skeleton" aria-label="Loading guided search" />
});

const CATEGORY_ICONS: Record<string, string> = {
  houses: '🏠',
  shops: '🏪',
  offices: '🏢',
  'event-halls': '🎉'
};

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Tell us what you need',
    description: 'Answer a few simple questions — what type of space, your budget, preferred location, and what matters most to you.',
    detail: 'Takes under 2 minutes'
  },
  {
    number: '02',
    icon: '✨',
    title: 'We match you intelligently',
    description: 'Our system finds properties that fit your exact needs — verified listings with confirmed vacancies, real prices, and honest information.',
    detail: 'No fake listings, ever'
  },
  {
    number: '03',
    icon: '🤝',
    title: 'Connect and move in',
    description: 'Contact the property manager directly via WhatsApp, arrange a viewing, and find your next space — all without hidden fees.',
    detail: 'Direct to property owners'
  }
];



export default function Home() {
  return (
    <PremiumLandingShell>
      <main>
        {/* ========== HERO ========== */}
        <section className="premium-hero" id="top">
          {/* Alive background layers */}
          <div className="hero-grid-lines" aria-hidden="true" />
          <div className="hero-glow-orb hero-glow-orb-1" aria-hidden="true" />
          <div className="hero-glow-orb hero-glow-orb-2" aria-hidden="true" />
          <div className="hero-glow-orb hero-glow-orb-3" aria-hidden="true" />
          <AmbientParticles />

          {/* Watermark */}
          <div className="hero-watermark" aria-hidden="true">PATASPACE</div>

          {/* Content grid */}
          <div className="hero-content">
            {/* Left column */}
            <div className="hero-left">
              <div className="hero-eyebrow premium-reveal" style={{ '--reveal-delay': '200' } as React.CSSProperties}>
                Built for Kenya
              </div>

              <h1 className="hero-title premium-reveal" style={{ '--reveal-delay': '250' } as React.CSSProperties}>
                Kenya&apos;s smart rental discovery platform
              </h1>

              <p className="hero-subtitle premium-reveal" style={{ '--reveal-delay': '350' } as React.CSSProperties}>
                {PLATFORM_FOUNDATION.projectName} helps Kenyans quickly find houses, shops, offices, and event halls through
                guided matching, verified rental listings, and intelligent support that stays behind the scenes.
              </p>

              <div className="hero-actions premium-reveal" style={{ '--reveal-delay': '450' } as React.CSSProperties}>
                <a className="pill-btn pill-btn-dark" href="#entry">
                  Begin guided search
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                <a className="pill-btn pill-btn-ghost" href="/properties/register">
                  List your property
                </a>
              </div>

              <div className="hero-trust-chips premium-reveal" style={{ '--reveal-delay': '550' } as React.CSSProperties}>
                <span>Kenya only</span>
                <span>Verified-first</span>
                <span>M-Pesa ready</span>
                <span>No login required</span>
              </div>
            </div>

            {/* Right column — entry cards */}
            <div className="hero-right premium-reveal" style={{ '--reveal-delay': '400' } as React.CSSProperties}>
              <HeroEntryCards />
            </div>
          </div>

          {/* Status bar */}
          <div className="hero-status-bar premium-reveal" style={{ '--reveal-delay': '700' } as React.CSSProperties}>
            <span>Working since 2024</span>
            <span style={{ display: 'none' }} className="sm-visible">Made in Nairobi, Kenya</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Scroll to explore ↓
            </span>
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section className="section-flow-glow" aria-hidden="true" />
        <ScrollReactiveSection>
          <section className="premium-section how-it-works-section">
            <div className="premium-heading premium-reveal">
              <span className="section-eyebrow">How it works</span>
              <h2>Find your next space in three simple steps</h2>
              <p>No agents, no hidden fees, no wasted time. Just honest matching based on what you actually need.</p>
            </div>

            <div className="how-it-works-grid">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <div key={step.number} className="how-it-works-card premium-stagger" data-stagger-index={String(i)}>
                  <div className="how-it-works-number">{step.number}</div>
                  <div className="how-it-works-icon" aria-hidden="true">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="how-it-works-detail">{step.detail}</span>
                </div>
              ))}
            </div>

            {/* Connector line between steps */}
            <div className="how-it-works-connector" aria-hidden="true">
              <div className="connector-dot connector-dot-1" />
              <div className="connector-line" />
              <div className="connector-dot connector-dot-2" />
              <div className="connector-line" />
              <div className="connector-dot connector-dot-3" />
            </div>
          </section>
        </ScrollReactiveSection>

        {/* ========== CATEGORIES (dark section) ========== */}
        <ScrollReactiveSection>
          <div className="premium-section-dark">
            <section className="premium-section">
              <div className="premium-heading premium-reveal">
                <span className="section-eyebrow">Supported categories</span>
                <h2>Four rental categories, nothing else</h2>
                <p>No sales, hotels, short-stay clone workflows, or extra categories. Just the rental foundations that matter in Kenya.</p>
              </div>

              <div className="dark-cards-grid">
                {PROPERTY_CATEGORIES.map((category, i) => (
                  <div key={category.id} className="dark-card premium-stagger" data-stagger-index={String(i)}>
                    <span className="dark-card-icon" aria-hidden="true">{CATEGORY_ICONS[category.id] ?? '🏘️'}</span>
                    <h3>{category.label}</h3>
                    <p>{category.description}</p>
                    <ul>
                      {category.supportedTypes.slice(0, 3).map((type) => (
                        <li key={type}>{type}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollReactiveSection>

        {/* ========== FEATURED PROPERTIES (live data) ========== */}
        <ScrollReactiveSection>
          <section className="premium-section featured-section">
            <div className="section-flow-glow section-flow-glow-top" aria-hidden="true" />
            <div className="premium-heading premium-reveal">
              <span className="section-eyebrow">Featured listings</span>
              <h2>Verified properties available now</h2>
              <p>Real listings from real property owners across Kenya. Unlock any listing to see full details, photos, and contact information.</p>
            </div>

            <FeaturedPropertiesLive />

            <div className="featured-see-all premium-reveal">
              <a className="pill-btn pill-btn-accent" href="#entry">
                Search all listings
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </section>
        </ScrollReactiveSection>

        {/* ========== GUIDED SEARCH ========== */}
        <ScrollReactiveSection>
          <section className="premium-section">
            <div className="premium-reveal">
              <GuidedSearch />
            </div>
          </section>
        </ScrollReactiveSection>

        {/* ========== TESTIMONIALS (live data) ========== */}
        <ScrollReactiveSection>
          <section className="premium-section testimonials-section">
            <div className="premium-heading premium-reveal">
              <span className="section-eyebrow">What Kenyans say</span>
              <h2>Real reviews from real tenants</h2>
              <p>Every review comes from a verified viewing interaction. No fake reviews, no paid testimonials.</p>
            </div>

            <TestimonialsLive />
          </section>
        </ScrollReactiveSection>

        {/* ========== LOCATIONS ========== */}
        <ScrollReactiveSection>
          <section className="premium-section locations-section">
            <div className="section-flow-glow section-flow-glow-top" aria-hidden="true" />
            <div className="premium-heading premium-reveal">
              <span className="section-eyebrow">Location architecture</span>
              <h2>Structured for every place in Kenya</h2>
              <p>Searches cover counties, towns, estates, suburbs, market centres, villages, and growing urban areas.</p>
            </div>
            <div className="premium-location-strip">
              {FEATURED_KENYA_LOCATIONS.map((location, i) => (
                <span key={location.id} className="premium-location-chip premium-stagger" data-stagger-index={String(i % 8)}>
                  {location.name}
                </span>
              ))}
            </div>
          </section>
        </ScrollReactiveSection>

        {/* ========== TRUST ========== */}
        <ScrollReactiveSection>
          <section className="premium-section trust-section">
            <div className="premium-heading premium-reveal">
              <span className="section-eyebrow">Trust first</span>
              <h2>Trust is more important than quantity</h2>
              <p>Every foundation decision is aimed at reducing fake listings, incorrect information, and frustration.</p>
            </div>
            <div className="premium-trust-grid">
              {TRUST_PRINCIPLES.map((signal, i) => (
                <div key={signal.id} className="premium-trust-card premium-stagger" data-stagger-index={String(i % 8)}>
                  <div className="premium-trust-icon" aria-hidden="true">✓</div>
                  <div>
                    <h3>{signal.label}</h3>
                    <p>{signal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReactiveSection>

        {/* ========== STATS ========== */}
        <ScrollReactiveSection>
          <PremiumStats />
        </ScrollReactiveSection>

        {/* ========== FOOTER ========== */}
        <footer className="premium-footer">
          <div className="premium-footer-watermark" aria-hidden="true">PATASPACE</div>

          <div className="premium-footer-inner">
            {/* CTA row */}
            <div className="footer-cta">
              <h2 className="premium-reveal">Ready to find your next space?</h2>
              <a className="pill-btn pill-btn-accent" href="#entry">
                Start searching
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
              </a>
            </div>

            {/* Columns */}
            <div className="footer-columns">
              <div className="footer-col footer-col-brand">
                <a className="brand" href="#top" aria-label="PataSpace home">
                  <span aria-hidden="true" style={{ display: 'grid', width: '2rem', height: '2rem', placeItems: 'center', borderRadius: '0.5rem', background: 'var(--brand)', color: '#fff', fontWeight: 900, fontSize: '0.85rem' }}>P</span>
                  PataSpace
                </a>
                <p>Smart rental discovery built for Kenya. Verified listings, guided matching, transparent information.</p>
              </div>

              <div className="footer-col">
                <h4>Explore</h4>
                <a href="#entry">Start Search</a>
                <a href="/properties/register">List Property</a>
                <a href="/match/house">Find a Home</a>
                <a href="/match/shop">Find a Shop</a>
              </div>

              <div className="footer-col">
                <h4>Categories</h4>
                <a href="/match/house">Houses</a>
                <a href="/match/shop">Shops</a>
                <a href="/match/office">Offices</a>
                <a href="/match/event-hall">Event Halls</a>
              </div>

              <div className="footer-col">
                <h4>Support</h4>
                <a href="/support">Contact Support</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
              </div>
            </div>

            {/* Legal bar */}
            <div className="footer-legal">
              <span>© {new Date().getFullYear()} PataSpace. All rights reserved.</span>
              <div className="footer-legal-links">
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Section-level ambient glow orbs (fixed, drift slowly) */}
      <div className="section-glow-orb section-glow-orb--1" aria-hidden="true" />
      <div className="section-glow-orb section-glow-orb--2" aria-hidden="true" />
      <div className="section-glow-orb section-glow-orb--3" aria-hidden="true" />

      {/* Grain texture overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Floating ambient blobs */}
      <SectionBlobs />

    </PremiumLandingShell>);
}
