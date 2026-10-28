import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { CloseIcon, MenuIcon } from './Icons.jsx';

export function BrandMark({ className = 'h-[30px] w-[30px] text-[17px]' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-md bg-primary font-serif font-semibold leading-none text-primary-fg ${className}`}
    >
      ∀
    </span>
  );
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  const isAdmin = user?.role === 'admin';
  const roleLabel = isAdmin ? 'Administrator' : 'Student';
  const initials = (user?.name ?? '')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Admins get tabs to move between the student view and the dashboard.
  const tabs = isAdmin
    ? [
        { to: '/', label: 'Modules', active: !pathname.startsWith('/admin') },
        { to: '/admin', label: 'Admin', active: pathname.startsWith('/admin') },
      ]
    : [];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-15 max-w-shell items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 rounded-md text-ink">
          <BrandMark />
          <span className="whitespace-nowrap font-serif text-[17px] font-semibold">
            Discrete Math Review
          </span>
        </Link>

        {tabs.length > 0 && (
          <nav aria-label="Primary" className="hidden gap-1 sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                aria-current={t.active ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 text-[15px] transition-colors ${
                  t.active
                    ? 'bg-primary-soft font-semibold text-primary-ink'
                    : 'font-medium text-ink-2 hover:bg-surface-3 hover:text-ink'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <>
              <div className="hidden items-center gap-2.5 rounded-full border border-line p-[3px] pr-3 sm:flex">
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft-2 text-xs font-semibold text-primary-ink"
                >
                  {initials}
                </span>
                <span className="flex flex-col leading-[15px]">
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted">{roleLabel}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-sm btn-ghost hidden sm:inline-flex"
              >
                Sign out
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink sm:hidden"
              >
                {menuOpen ? (
                  <CloseIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {user && menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-line bg-surface px-4 pb-4 pt-3 sm:hidden"
        >
          <div className="mb-3 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft-2 text-sm font-semibold text-primary-ink"
            >
              {initials}
            </span>
            <span className="flex flex-col leading-5">
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm text-muted">{roleLabel}</span>
            </span>
          </div>
          {tabs.length > 0 && (
            <nav aria-label="Primary" className="mb-3 flex flex-col gap-1">
              {tabs.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  aria-current={t.active ? 'page' : undefined}
                  className={`rounded-md px-3 py-2.5 ${
                    t.active
                      ? 'bg-primary-soft font-semibold text-primary-ink'
                      : 'font-medium text-ink-2'
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary w-full"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
