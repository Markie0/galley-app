/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Dòng này cực kỳ quan trọng để kích hoạt Dark Mode bằng class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}