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
          primary: '#19A66A',
          primaryHover: '#158D5A',
          primaryLight: '#D4F2E4',
          accent: '#D9A33A',
          accentHover: '#C4912F',
          accentLight: '#F5EAD0',
          beige: '#F4EEDF',
          yellow: '#D9A33A',
          yellowHover: '#C4912F',
          dark: '#173F73',
          darkCard: '#1A4A82',
          card: '#FFFFFF',
          gray: '#6B7280',
          lightGray: '#E2E8F0',
          goldLight: '#F5EAD0',
          accentGreen: '#19A66A',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
