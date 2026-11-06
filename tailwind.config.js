/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--brand-${n}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        // Driven by CSS variables so the theme color can be changed at runtime (see src/theme.js)
        brand: {
          50: v(50), 100: v(100), 200: v(200), 300: v(300), 400: v(400),
          500: v(500), 600: v(600), 700: v(700), 800: v(800), 900: v(900),
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
