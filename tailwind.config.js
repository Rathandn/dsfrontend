// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',   // teal-600
        secondary: '#06b6d4', // cyan-500
      },
    },
  },
  plugins: [],
}
