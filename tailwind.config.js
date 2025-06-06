module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      dropShadow: {
        glow: "0 0 16px #38bdf8, 0 0 32px #8b5cf6, 0 0 2px #fff"
      }
    },
    fontFamily: {
      sans: ["Inter", "Poppins", "sans-serif"]
    }
  },
  plugins: [],
}; 