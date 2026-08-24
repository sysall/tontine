/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#D8C911',
          primaryHover: '#C2B40F',
          primaryLight: '#FAF8D6',
          accent: '#D8C911',
          accentHover: '#C2B40F',
          accentLight: '#FAF8D6',
          beige: '#F8FAF7',
          yellow: '#D8C911',
          yellowHover: '#C2B40F',
          dark: '#04252D',
          darkCard: '#0A333D',
          card: '#FFFFFF',
          gray: '#6B7280',
          lightGray: '#E2E8F0',
          goldLight: '#FAF8D6',
          accentGreen: '#10B981',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
