import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './Icons.jsx';

// The initial class is set by the inline script in index.html (saved choice,
// else the OS setting). This button flips it and remembers the choice.
export function useTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  function toggle() {
    setDark((d) => {
      const next = !d;
      try {
        localStorage.setItem('dmra_theme', next ? 'dark' : 'light');
      } catch {
        /* storage unavailable: theme still applies for this session */
      }
      return next;
    });
  }

  return { dark, toggle };
}

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
