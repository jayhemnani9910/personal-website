/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // Custom utilities for 3D tilt effect
      perspective: {
        '1000': '1000px',
      },
    },
  },
  plugins: [
    // Add custom perspective utility
    function({ addUtilities }) {
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
      })
    },
  ],
}
