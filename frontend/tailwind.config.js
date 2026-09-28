/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F6F2',
        ink: '#1E2A38',
        line: '#DAD6CC',
        accent: {
          DEFAULT: '#4B9CD3',
          dark: '#2E6F9E',
        },
        good: '#3F7D58',
        warn: '#B5542B',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
