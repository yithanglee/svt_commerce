/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  
	plugins: [require('flowbite/plugin')],
  
	darkMode: 'class',
  
	theme: {
	  extend: {
		colors: {
		  // flowbite-svelte
		  primary: {
			DEFAULT: '#3899fa',
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			300: '#93c5fd',
			400: '#60a5fa',
			500: '#3899fa',
			600: '#2563eb',
			700: '#1d4ed8',
			800: '#1e40af',
			900: '#1e3a8a'
		  },
		  'background-light': '#f5f7f8',
		  'background-dark': '#0f1923'
		},
		fontFamily: {
		  'display': ['Manrope', 'sans-serif']
		},
		borderRadius: {
		  'DEFAULT': '0.25rem',
		  'lg': '0.5rem',
		  'xl': '0.75rem',
		  'full': '9999px'
		}
	  }
	}
  };
  
  module.exports = config;