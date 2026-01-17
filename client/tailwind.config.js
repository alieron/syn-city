/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a8b8',
          400: '#ec7892',
          500: '#e0516f',
          600: '#cc315a',
          700: '#ab234a',
          800: '#8e2043',
          900: '#791f3e',
          950: '#430b1e',
        },
      },
    },
  },
  plugins: [],
}