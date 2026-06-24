/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: '#0066cc',
          cyan: '#00e5ff',
          red: '#ff1744',
          green: '#00e676',
          yellow: '#ffea00',
          dark: '#0a192f',
        }
      },
    },
  },
  plugins: [],
}
