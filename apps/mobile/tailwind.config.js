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
          beige: '#FDFBF7',
          yellow: '#FFC700',
          yellowHover: '#E6B200',
          dark: '#1A1A1A',
          card: '#FFFFFF',
          gray: '#6B7280',
          lightGray: '#E5E7EB',
          goldLight: '#FFF8E7',
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
