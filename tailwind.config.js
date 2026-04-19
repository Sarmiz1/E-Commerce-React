/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
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
        'max-2xl': { 'min': '2000px' },
        'sm-min': { 'min': '500px' },
        'sm-max': { 'max': '500px' }
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
      keyframes: {
        slideX: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100vw)' }, // slide across screen
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-10px)' },
          '40%, 80%': { transform: 'translateX(10px)' },
        },
        fadeInHero: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInImage: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fadeInFeature: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeInProduct: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fadeInTestimonial: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeInCTA: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        'slide-x': 'slideX 8s linear infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
        fadeInHero: "fadeInHero 1s ease-in forwards",
        fadeInImage: "fadeInImage 1s ease-in forwards",
        fadeInFeature: "fadeInFeature 1s ease-out forwards",
        fadeInProduct: "fadeInProduct 1s ease-out forwards",
        fadeInTestimonial: "fadeInTestimonial 1s ease-out forwards",
        fadeInCTA: "fadeInCTA 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};




