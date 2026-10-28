/** @type {import('tailwindcss').Config} */

// Semantic colors are CSS variables (defined in src/index.css for light and
// .dark) so one class like `bg-surface` works in both themes and opacity
// modifiers (`bg-primary/10`) still work.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: v('page'),
        surface: {
          DEFAULT: v('surface'),
          2: v('surface-2'),
          3: v('surface-3'),
        },
        line: { DEFAULT: v('line'), strong: v('line-strong') },
        ink: { DEFAULT: v('ink'), 2: v('ink-2') },
        muted: v('muted'),
        faint: v('faint'),
        primary: {
          DEFAULT: v('primary'),
          hover: v('primary-hover'),
          fg: v('primary-fg'),
          soft: v('primary-soft'),
          'soft-2': v('primary-soft-2'),
          line: v('primary-line'),
          ink: v('primary-ink'),
        },
        success: {
          DEFAULT: v('success'),
          soft: v('success-soft'),
          line: v('success-line'),
          ink: v('success-ink'),
        },
        danger: {
          DEFAULT: v('danger'),
          soft: v('danger-soft'),
          line: v('danger-line'),
          ink: v('danger-ink'),
        },
        warning: {
          DEFAULT: v('warning'),
          soft: v('warning-soft'),
          ink: v('warning-ink'),
        },
        theorem: {
          DEFAULT: v('theorem'),
          soft: v('theorem-soft'),
          line: v('theorem-line'),
          ink: v('theorem-ink'),
        },
        hero: v('hero'),
        // Raw brand scale for decoration. Use 600+ for text on white (500 is 2.9:1).
        carolina: {
          50: '#F0F6FB',
          100: '#DDEBF6',
          200: '#BCD8EE',
          400: '#7BAFD4',
          500: '#4B9CD3',
          600: '#2E6F9E',
          700: '#245A82',
          900: '#13324A',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"Source Code Pro"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        overline: [
          '0.75rem',
          { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '600' },
        ],
        meta: ['0.8125rem', { lineHeight: '1.125rem' }],
        prose: ['1.125rem', { lineHeight: '1.875rem' }],
        h4: ['1.0625rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        h3: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        h2: [
          '1.5rem',
          { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.005em' },
        ],
        h1: [
          '1.875rem',
          {
            lineHeight: '2.375rem',
            fontWeight: '600',
            letterSpacing: '-0.01em',
          },
        ],
        display: [
          '2.25rem',
          {
            lineHeight: '2.75rem',
            fontWeight: '600',
            letterSpacing: '-0.015em',
          },
        ],
      },
      spacing: {
        15: '3.75rem', // navbar height
        18: '4.5rem',
      },
      maxWidth: {
        reading: '42.5rem', // 680px lecture measure
        shell: '73rem', // 1168px app shell
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        drawer: 'var(--shadow-drawer)',
      },
    },
  },
  plugins: [],
};
