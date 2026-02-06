/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        darkGreen: 'rgb(8, 79, 45)',
        limeGreen: 'rgb(186, 255, 190)',
        greenPry: 'rgb(25, 135, 84)',
      },
      screens: {
        'max-2xl': {'max': '2000px'},
      },
    },
  },
  plugins: [],
};
