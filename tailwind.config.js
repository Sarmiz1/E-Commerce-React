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
        greenPry: 'rgb(25, 135, 84)',
        darkGreen: 'rgb(8, 79, 45)',
        limeGreen: 'rgb(186, 255, 190)',
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
        columnSm: {
            'column-gap': '0px'
          },
        columnMd: {
            'column-gap': '35px'
          },       
        rowSm: {
            'row-gap': '0px'
          },
        rowLg: {
            'row-gap': '60px'
          }
      },
      spacing: {
        letterSpacingSm: {
          'letter-spacing': '1.1px'
        },
      },
    },
  },
  plugins: [],
};
