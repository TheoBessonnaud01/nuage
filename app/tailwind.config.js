/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="sombre"]'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        sauge: token('sauge'),
        'sauge-fort': token('sauge-fort'),
        sable: token('sable'),
        lavande: token('lavande'),
        ciel: token('ciel'),
        peche: token('peche'),
      },
      fontFamily: { sans: ['"Nunito Variable"', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '1.25rem' },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' },
    },
  },
  plugins: [],
};
