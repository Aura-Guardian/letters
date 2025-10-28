/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        handwritten: ['"Dancing Script"', "cursive"],
      },
      colors: {
        paper: "#fdf6ec",   // warm cream
        ink: "#3b2f2f",     // deep brown
        edge: "#b69f83",    // soft brown for borders
      },
      boxShadow: {
        "soft-card": "0 20px 30px rgba(0,0,0,0.15)",
        "soft-inner": "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 4px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
