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
        hover: 'rgba(25, 135, 84, 0.75)',
        secondary: 'rgb(255, 255, 255)'
      },
      screens: {
        'max-2xl': {'min': '2000px'},
        'sm-min' : {'min': '500px'},
        'sm-max' : {'max': '500px'}
      },
      boxShadow: {
        xxxl: {
          'box-shadow': '0 2px 5px rgba(220, 220, 220, 0.5)'
        },
      },
      gap: {
        'column-gap': {
          0:{
            'column-gap': '0px'
          },
          35: {
            'column-gap': '35px'
          }
        },       
        'row-gap': {
          0 : {
            'row-gap': '0px'
          },
          60: {
            'row-gap': '60px'
          }
        },
      }
    },
  },
  plugins: [],
};
