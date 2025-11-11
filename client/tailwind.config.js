/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(262 80% 50%)',
        'primary-light': 'hsl(262 80% 60%)',
        'primary-dark': 'hsl(262 80% 40%)',
        'surface-1': 'hsl(260 40% 98%)',
        'surface-2': 'hsl(260 25% 92%)',
        'surface-3': 'hsl(260 10% 85%)',
        'on-surface': 'hsl(260 10% 20%)',
        'on-primary': 'hsl(0 0% 100%)',
        'secondary-container': 'hsl(280 80% 90%)',
        'on-secondary-container': 'hsl(280 50% 30%)',
      },
      fontFamily: {
          sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
