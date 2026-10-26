/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="sombre"]'],
  theme: {
    extend: {
      colors: {
        // Système visuel v2
        'c-bg': token('c-bg'),
        'c-surface': token('c-surface'),
        'c-surface-2': token('c-surface-2'),
        'c-ink': token('c-ink'),
        'c-muted': token('c-muted'),
        'c-line': token('c-line'),
        'c-primary': token('c-primary'),
        'c-on-primary': token('c-on-primary'),
        'c-accent': token('c-accent'),
        'c-accent-soft': token('c-accent-soft'),
        'c-on-grad': token('c-on-grad'),
        'c-on-grad-muted': token('c-on-grad-muted'),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        text: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      borderRadius: { card: '1.25rem' },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' },
    },
  },
  plugins: [],
};
