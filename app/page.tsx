import dynamic from 'next/dynamic';
import { AtlasHeader } from '@/components/landing/AtlasHeader';
import { AtlasInterview } from '@/components/landing/AtlasInterview';
import { AtlasReviews } from '@/components/landing/AtlasReviews';
import { HeroFilm } from '@/components/landing/HeroFilm';
import { ArrowRight, BrandMark, CategoryGlyph } from '@/components/landing/glyphs';
import { EntryPointCards } from '@/components/EntryPointCards';
import { FEATURED_KENYA_LOCATIONS } from '@/domain/locations';

const AtlasFeatured = dynamic(
  () => import('@/components/landing/AtlasFeatured').then((mod) => mod.AtlasFeatured),
  {
    loading: () => (
      <div className="ps-listings__grid" aria-busy="true" aria-label="Loading featured listings">
        {[0, 1, 2].map((item) => (
          <div key={item} className="ps-skeleton" />
        ))}
      </div>
    )
  }
);

const TICKER_LOCATIONS = FEATURED_KENYA_LOCATIONS.map((location) => location.name);

const STANDARDS = [
  {
    number: '01',
    title: 'Verified before visible.',
    body: 'A person looks at every property — photos, address, rent, and the person behind the listing — before it ever reaches your screen.',
    foot: 'Human-reviewed, not auto-approved'
  },
  {
    number: '02',
    title: 'Vacant, not just listed.',
    body: 'Owners confirm availability on a 24-hour cycle. If a space is gone, it leaves the atlas instead of wasting your calls.',
    foot: 'Freshness is part of the listing'
  },
  {
    number: '03',
    title: 'Prices without theatre.',
    body: 'The rent you see is the rent discussed. Deposits, water, and what is included are written plainly. No bait numbers.',
    foot: 'One honest price'
  }
];

const STEPS = [
  {
    number: '01',
    title: 'Tell us what you need',
    body: 'Pick a category and answer a short, structured interview. Type, area, budget, and the things that actually matter to you.',
    note: 'Usually under two minutes'
  },
  {
    number: '02',
    title: 'See what actually fits',
    body: 'We match your answers against verified listings with confirmed vacancies — ranked by fit, never by who paid for attention.',
    note: 'Matched, not spammed'
  },
  {
    number: '03',
    title: 'Visit, then decide',
    body: 'Unlock the full details, speak directly to the property manager on WhatsApp, and arrange a viewing without the runaround.',
    note: 'No broker games'
  }
];

const NUMBERS = [
  { value: '47', label: 'Counties in the atlas' },
  { value: '04', label: 'Rental categories, nothing else' },
  { value: '24h', label: 'Vacancy confirmation cycle' },
  { value: '00', label: 'Fake listings tolerated' }
];

const OWNER_TILES = [
  { number: '01', label: 'Houses', category: 'houses' as const },
  { number: '02', label: 'Shops', category: 'shops' as const },
  { number: '03', label: 'Offices', category: 'offices' as const },
  { number: '04', label: 'Event halls', category: 'event-halls' as const }
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/pataspace' },
  { label: 'Instagram', href: 'https://www.instagram.com/pataspace' },
  { label: 'X', href: 'https://x.com/pataspace' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/pataspace' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@pataspace' }
];

export default function Home() {
  return (
    <div className="ps-atlas">
      <a className="ps-skip" href="#main">
        Skip to content
      </a>
      <div className="ps-progress" aria-hidden="true" />

      <AtlasHeader />

      <main className="ps-main" id="main">
        {/* ============ CINEMATIC HERO ============ */}
        <section className="ps-cinema" data-act="1" aria-labelledby="hero-title">
          <div className="ps-cinema__pin">
            <div className="ps-cinema__art">
              <HeroFilm />
              <div className="ps-cinema__scrim" aria-hidden="true" />
              <div className="ps-cinema__grain" aria-hidden="true" />
            </div>

            <p className="ps-cinema__filmCue" aria-hidden="true">
              <span className="ps-cinema__filmCueDot" />
              <span>Silent city film</span>
              <span className="ps-cinema__filmCueAction">
                Scroll to play
                <span className="ps-cinema__filmCueArrow">↓</span>
              </span>
            </p>

            <p className="ps-cinema__coord" aria-hidden="true">
              01° 17′ S · 36° 49′ E — Nairobi, Kenya
            </p>

            <div className="ps-cinema__actNo" aria-hidden="true">
              <span>01</span>
              <span>02</span>
              <span>03</span>
            </div>

            <div className="ps-cinema__inner">
              <div className="ps-cinema__copy">
                <div className="ps-cinema__chapters">
                  <article className="ps-cinema__chapter ps-cinema__chapter--1">
                    <div className="ps-hero__copy">
                      <p className="ps-kicker">
                        <span>The Kenya rental atlas</span>
                        <span>No. 001</span>
                      </p>

                      <h1 className="ps-hero__title" id="hero-title">
                        Pata
                        <br />
                        <em>space.</em>
                      </h1>

                      <p className="ps-hero__gloss">
                        <b>pata</b> <i>Swahili, v.</i> — to find; to get.
                      </p>

                      <p className="ps-hero__lede">
                        PataSpace helps Kenyans quickly find houses, shops, offices, and event halls — through a few
                        clear questions, verified listings, and vacancies that are actually confirmed.
                      </p>

                      <div className="ps-hero__actions">
                        <a className="ps-btn ps-btn--ochre" href="#entry">
                          Begin guided search
                          <ArrowRight />
                        </a>
                        <a className="ps-btn ps-btn--ghost" href="/properties/register">
                          List your property
                        </a>
                      </div>

                      <div className="hero-trust-chips ps-hero__chips" aria-label="PataSpace promises">
                        <span>Kenya only</span>
                        <span>Verified-first</span>
                        <span>M-Pesa ready</span>
                        <span>No account to browse</span>
                      </div>
                    </div>
                  </article>

                  <article className="ps-cinema__chapter ps-cinema__chapter--2">
                    <div className="ps-hero__copy">
                      <p className="ps-kicker">
                        <span>02 / The standard</span>
                        <span>Human-checked</span>
                      </p>
                      <h2 className="ps-hero__title ps-hero__title--chapter">
                        Verified
                        <br />
                        <em>before visible.</em>
                      </h2>
                      <p className="ps-hero__chapterLede">
                        A person visits every property. Photos, address, rent, and the person behind the listing are
                        checked before you ever see it. If a space is gone, it leaves the atlas.
                      </p>
                      <ul className="ps-cinema__claims">
                        <li>
                          <b>47</b>
                          <span>counties in the atlas</span>
                        </li>
                        <li>
                          <b>24h</b>
                          <span>vacancy confirmation cycle</span>
                        </li>
                        <li>
                          <b>00</b>
                          <span>fake listings tolerated</span>
                        </li>
                      </ul>
                      <div className="ps-hero__actions">
                        <a className="ps-btn ps-btn--ochre" href="#standard">
                          See the standard
                          <ArrowRight />
                        </a>
                        <a className="ps-btn ps-btn--ghost" href="#how">
                          How it works
                        </a>
                      </div>
                    </div>
                  </article>

                  <article className="ps-cinema__chapter ps-cinema__chapter--3">
                    <div className="ps-hero__copy">
                      <p className="ps-kicker">
                        <span>03 / The opening</span>
                        <span>Ready when you are</span>
                      </p>
                      <h2 className="ps-hero__title ps-hero__title--chapter">
                        Find the one.
                        <br />
                        <em>Then move.</em>
                      </h2>
                      <p className="ps-hero__chapterLede">
                        A few clear questions. A short list of spaces that actually fit. Direct contact when you&apos;re
                        ready — no broker games, no dead ends.
                      </p>
                      <div className="ps-hero__actions">
                        <a className="ps-btn ps-btn--ochre" href="#entry">
                          Begin guided search
                          <ArrowRight />
                        </a>
                        <a className="ps-btn ps-btn--ghost" href="/properties/register">
                          List your property
                        </a>
                      </div>
                      <p className="ps-cinema__actNote">Free to browse · Sign in only when you&apos;re ready to unlock.</p>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="ps-cinema__readout ps-cinema__flight" aria-label="Film flight path">
                <p className="ps-cinema__readoutMeta">
                  <span>Flight path · 001</span>
                  <span>Silent</span>
                </p>
                <ol className="ps-cinema__route">
                  <li>
                    <span className="ps-cinema__routeNo">01</span>
                    <span className="ps-cinema__routeCopy">
                      <b>The city</b>
                      <small>Nairobi, in motion</small>
                    </span>
                  </li>
                  <li>
                    <span className="ps-cinema__routeNo">02</span>
                    <span className="ps-cinema__routeCopy">
                      <b>The standard</b>
                      <small>Checked before it&apos;s shown</small>
                    </span>
                  </li>
                  <li>
                    <span className="ps-cinema__routeNo">03</span>
                    <span className="ps-cinema__routeCopy">
                      <b>The opening</b>
                      <small>Find it, then move</small>
                    </span>
                  </li>
                </ol>
                <div className="ps-cinema__meter" aria-hidden="true">
                  <i />
                </div>
                <p className="ps-cinema__readoutFoot">
                  <span className="ps-cinema__scrollHint">Scroll to move through the city. Reverse to rewind.</span>
                  <span className="ps-cinema__staticHint">City film. Motion is reduced on this device.</span>
                  <span className="ps-cinema__timecode">00.0 — 10.0s</span>
                </p>
              </aside>
            </div>

            <div className="ps-cinema__foot">
              <span>Verified before visible</span>
              <span>Vacancy checked daily</span>
              <span>Built in Nairobi</span>
              <span>Scroll to move through the city. Reverse to rewind.</span>
            </div>
          </div>
        </section>

        {/* ============ LOCATION TICKER ============ */}
        <div className="ps-ticker" aria-hidden="true">
          <div className="ps-ticker__track">
            {[0, 1].map((group) => (
              <div className="ps-ticker__group" key={group}>
                {TICKER_LOCATIONS.map((location) => (
                  <span className="ps-ticker__item" key={`${group}-${location}`}>
                    {location}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ============ 01 THE STANDARD ============ */}
        <section className="ps-band" id="standard" aria-labelledby="standard-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label">01 / The standard</span>
              <h2 className="ps-section__title" id="standard-title">
                Trust isn&apos;t a badge we print. It&apos;s a <em>habit.</em>
              </h2>
              <p className="ps-section__lead">
                Anyone can put a space online. PataSpace only puts it in front of you once it has been checked,
                confirmed, and kept honest — over and over again.
              </p>
            </div>

            <div className="ps-standard">
              <div className="ps-standard__aside">
                <p className="ps-standard__quote">Fewer, better listings. That is the whole idea.</p>
                <p className="ps-standard__note">
                  A smaller board you can trust beats a bigger one you can&apos;t. Every rule below exists for that one
                  reason.
                </p>
                <div className="ps-standard__stamp" aria-hidden="true">
                  <span>
                    <b>PataSpace</b>
                    verified
                    <br />
                    Kenya only
                    <br />
                    est. 2024
                  </span>
                </div>
              </div>

              <ol className="ps-rules">
                {STANDARDS.map((rule) => (
                  <li className="ps-rule" key={rule.number}>
                    <span className="ps-rule__no">{rule.number}</span>
                    <div className="ps-rule__body">
                      <h3>{rule.title}</h3>
                      <p>{rule.body}</p>
                    </div>
                    <span className="ps-rule__foot">{rule.foot}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============ 02 FOUR WAYS IN ============ */}
        <section className="ps-band ps-band--ink" id="entry" aria-labelledby="entry-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label ps-label--light">02 / Four ways in</span>
              <h2 className="ps-section__title" id="entry-title">
                Choose a door. We&apos;ll do the <em>asking.</em>
              </h2>
              <p className="ps-section__lead">
                One guided path for each kind of space. No endless filters, no wall of results — just the questions that
                narrow the search to what you actually want.
              </p>
            </div>

            <EntryPointCards />
          </div>
        </section>

        {/* ============ 03 FEATURED LISTINGS ============ */}
        <section className="ps-band" id="listings" aria-labelledby="listings-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label">03 / On the board</span>
              <h2 className="ps-section__title" id="listings-title">
                Spaces you can <em>actually visit.</em>
              </h2>
              <p className="ps-section__lead">
                Verified properties with confirmed vacancies. Unlock a listing when you want the full picture, photos,
                and direct contact.
              </p>
            </div>

            <AtlasFeatured />
          </div>
        </section>

        {/* ============ 04 THE INTERVIEW ============ */}
        <section className="ps-band ps-band--paper-soft" id="interview" aria-labelledby="interview-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label">04 / The interview</span>
              <h2 className="ps-section__title" id="interview-title">
                A conversation, not a <em>form.</em>
              </h2>
              <p className="ps-section__lead">
                PataSpace asks a few structured questions. Each answer decides what comes next, so the interview gets
                shorter — not longer — as it learns what you need.
              </p>
            </div>

            <AtlasInterview />
          </div>
        </section>

        {/* ============ 05 HOW IT WORKS ============ */}
        <section className="ps-band ps-band--ink" id="how" aria-labelledby="how-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label ps-label--light">05 / The route</span>
              <h2 className="ps-section__title" id="how-title">
                Three moves to your next <em>address.</em>
              </h2>
              <p className="ps-section__lead">
                From first question to front door. The intelligence stays quietly behind the scenes — you simply get
                clearer options.
              </p>
            </div>

            <div className="ps-steps">
              {STEPS.map((step) => (
                <div className="ps-step" key={step.number}>
                  <span className="ps-step__no">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <span className="ps-step__note">{step.note}</span>
                </div>
              ))}
            </div>

            <div className="ps-steps__foot">
              <span>Most interviews take under two minutes. No account needed to start.</span>
              <a className="ps-btn ps-btn--ochre ps-btn--sm" href="#entry">
                Begin guided search
                <ArrowRight />
              </a>
            </div>
          </div>
        </section>

        {/* ============ 06 REVIEWS ============ */}
        <section className="ps-band" id="reviews" aria-labelledby="reviews-title">
          <div className="ps-section">
            <div className="ps-section__head">
              <span className="ps-label">06 / Word of mouth</span>
              <h2 className="ps-section__title" id="reviews-title">
                What finding a space should feel <em>like.</em>
              </h2>
              <p className="ps-section__lead">
                Every review here follows a completed viewing. No paid placements, no invented tenants, no five stars
                before the keys.
              </p>
            </div>

            <AtlasReviews />
          </div>
        </section>

        {/* ============ THE SHAPE OF IT ============ */}
        <section className="ps-band ps-band--paper-soft" aria-labelledby="numbers-title">
          <div className="ps-section ps-section--tight">
            <div className="ps-section__head">
              <span className="ps-label">07 / The shape of it</span>
              <h2 className="ps-section__title" id="numbers-title">
                One country. <em>All of it.</em>
              </h2>
              <p className="ps-section__lead">
                Kenya only is not a limitation. It is the reason the location hierarchy, the prices, and the language
                feel like home — from Nairobi to the smallest market centre.
              </p>
            </div>

            <div className="ps-numbers">
              <div className="ps-numbers__grid">
                {NUMBERS.map((item) => (
                  <div className="ps-number" key={item.label}>
                    <b>{item.value}</b>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="ps-numbers__note">
                Counting what we can stand behind. Kenya has 47 counties; PataSpace is built for every one of them.
              </p>
            </div>
          </div>
        </section>

        {/* ============ OWNERS ============ */}
        <section className="ps-owner" aria-labelledby="owner-title">
          <div className="ps-owner__inner">
            <div>
              <span className="ps-label">For owners and managers</span>
              <h2 className="ps-owner__title" id="owner-title">
                Empty space? Put it <em>on the atlas.</em>
              </h2>
              <p className="ps-owner__copy">
                Register a house, shop, office, or event hall. Our team reviews every listing before it goes live, and
                the people who find it are already looking for exactly that space.
              </p>
              <div className="ps-owner__actions">
                <a className="ps-btn ps-btn--ink" href="/properties/register">
                  List your property
                  <ArrowRight />
                </a>
                <a className="ps-btn ps-btn--outline" href="#standard">
                  Read the standard
                </a>
              </div>
            </div>

            <div className="ps-owner__art" aria-hidden="true">
              {OWNER_TILES.map((tile) => (
                <div className="ps-owner__tile" key={tile.number}>
                  <span>{tile.number} / 04</span>
                  <CategoryGlyph category={tile.category} />
                  <b>{tile.label}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer ps-footer">
        <div className="ps-footer__inner">
          <div className="ps-footer__cta">
            <span className="ps-label ps-label--light">PataSpace · Kenya</span>
            <h2>
              Ready to find your <em>space?</em>
            </h2>
            <div className="ps-footer__ctaRow">
              <a className="ps-btn ps-btn--ochre" href="#entry">
                Begin guided search
                <ArrowRight />
              </a>
              <p>Start with the four ways in. No account needed until you want to save or unlock a listing.</p>
            </div>
          </div>

          <div className="ps-footer__cols">
            <div className="ps-footer__col ps-footer__brand">
              <a className="ps-brand" href="#top" aria-label="PataSpace home">
                <BrandMark className="ps-brand__mark" />
                <span className="ps-brand__word">PataSpace</span>
              </a>
              <p>
                Kenya&apos;s smart rental discovery platform. Verified listings, guided matching, and honest information
                for houses, shops, offices, and event halls.
              </p>
              <div className="ps-footer__social" aria-label="PataSpace social channels">
                {SOCIALS.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer noopener">
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="ps-footer__col">
              <h3>Explore</h3>
              <a href="#entry">Start a search</a>
              <a href="/match/house">Houses</a>
              <a href="/match/shop">Shops</a>
              <a href="/match/office">Offices</a>
              <a href="/match/event-hall">Event halls</a>
            </div>

            <div className="ps-footer__col">
              <h3>Owners</h3>
              <a href="/properties/register">List a property</a>
              <a href="/properties/register/house">Register a house</a>
              <a href="/properties/register/shop">Register a shop</a>
              <a href="/properties/register/office">Register an office</a>
              <a href="/properties/register/event-hall">Register an event hall</a>
            </div>

            <div className="ps-footer__col">
              <h3>Company</h3>
              <a href="#standard">About PataSpace</a>
              <a href="#reviews">Reviews</a>
              <a href="/support">Contact Support</a>
              <a href="/auth/login">Sign in</a>
              <a href="/auth/register">Create an account</a>
            </div>
          </div>

          <div className="ps-footer__notes">
            <p className="ps-footer__note" id="privacy">
              <b>Privacy Policy</b>
              Your searches stay private. We use them to improve matches and never sell your data. You can request,
              export, or delete your account information at any time.
            </p>
            <p className="ps-footer__note" id="terms">
              <b>Terms of Service</b>
              Listings must be honest and vacancy-confirmed. PataSpace may remove any listing that misrepresents a
              space, a price, or its availability. Kenya only.
            </p>
          </div>

          <div className="ps-footer__legal">
            <span>© {new Date().getFullYear()} PataSpace. All rights reserved.</span>
            <div className="ps-footer__legalLinks">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <span>Made in Nairobi · M-Pesa ready</span>
            </div>
          </div>
        </div>

        <p className="ps-footer__word" aria-hidden="true">
          Pata<em>Space</em>
        </p>
      </footer>
    </div>
  );
}
