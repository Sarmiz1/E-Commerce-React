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
        greenPryTrans: 'rgba(25, 135, 84, 0.5)',
        borderColor: 'rgb(222, 222, 222)',
        hover: 'rgba(25, 135, 84, 0.75)'
      },
      screens: {
        'max-2xl': {'max': '2000px'},
      },
      boxShadow: {
        xxxl: {
          'box-shadow': '0 2px 5px rgba(220, 220, 220, 0.5)'
        },
      },
    },
  },
  plugins: [],
};
