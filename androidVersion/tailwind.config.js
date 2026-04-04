/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        background: '#0F0E17',
        surface: '#1A1929',
      },
    },
  },
  plugins: [],
};
