/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

module.exports = {
    content: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx}', // Certifique-se de incluir os arquivos Vue
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
// tailwind.config.js