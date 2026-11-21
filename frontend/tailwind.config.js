/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pg: {
          primary: '#138A4B',
          secondary: '#22A06B',
          light: '#EAF7EF',
          bg: '#F7F9FC',
          card: '#FFFFFF',
          text: '#172033',
          muted: '#64748B',
          danger: '#EF4444',
          warning: '#F59E0B',
          safe: '#16A34A'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        highlight: '0 10px 15px -3px rgba(19, 138, 75, 0.1), 0 4px 6px -2px rgba(19, 138, 75, 0.05)'
      }
    },
  },
  plugins: [],
}
