/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dare-devil': '#FF5B22',    // Turuncu
        'arctic': '#AEE6ED',         // Açık mavi/cyan
        'electric': '#3939FF',       // Parlak mavi
        'royal': '#DBB8FF',          // Açık mor/lavanta
        'gold': '#F2BB05',          // Altın sarısı
      },
    },
  },
  plugins: [],
};
