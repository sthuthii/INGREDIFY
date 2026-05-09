/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Same brand palette as the web app
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        surface: {
          DEFAULT:          '#ffffff',
          secondary:        '#f8fafc',
          dark:             '#0f1117',
          'dark-secondary': '#1a1d27',
          'dark-tertiary':  '#242736',
        },
      },
      fontFamily: {
        sans:    ['DMSans_400Regular'],
        display: ['Syne_700Bold'],
        mono:    ['JetBrainsMono_400Regular'],
      },
    },
  },
  plugins: [],
}