/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': 'var(--bg-black)',
        'game-card': 'var(--card-bg)',
        'game-primary': 'var(--primary-violet)',
        'game-secondary': 'var(--secondary-violet)',
        'game-gray': 'var(--text-gray)',
        'game-accent': 'var(--accent-neon)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}