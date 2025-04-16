/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

// Add PrimeUI to the plugins array

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{html,vue}', // Adiciona a pasta components
    './templates/**/*.html',       // Adiciona arquivos HTML em templates
  ],
    theme: {},
    plugins: [PrimeUI],
  };
// tailwind.config.js