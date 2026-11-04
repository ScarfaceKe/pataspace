import { BrandMark } from '@/components/landing/glyphs';

const NAV_LINKS = [
  { href: '#standard', label: 'The standard' },
  { href: '#entry', label: 'Four ways in' },
  { href: '#listings', label: 'On the board' },
  { href: '#how', label: 'How it works' }
];

export function AtlasHeader() {
  return (
    <header className="ps-header" id="top">
      <div className="ps-header__inner">
        <a className="ps-brand" href="#top" aria-label="PataSpace home">
          <BrandMark className="ps-brand__mark" />
          <span className="ps-brand__word">PataSpace</span>
          <span className="ps-brand__tag">KE</span>
        </a>

        <nav className="ps-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ps-header__actions">
          <a className="ps-header__signin" href="/auth/login">
            Sign in
          </a>
          <a className="ps-btn ps-btn--ochre ps-btn--sm" href="#entry">
            Start a search
          </a>
          <details className="ps-mobile-menu">
            <summary>Menu</summary>
            <div className="ps-mobile-menu__panel">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
              <a href="/auth/login">Sign in</a>
              <a href="/properties/register">List a space</a>
              <a href="#entry">Start a search</a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
