/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'black-primary': '#000000',
        'black-secondary': '#0A0A0A',
        'black-tertiary': '#141414',
        'white-accent': '#FFFFFF',
        'white-secondary': '#E5E5E5',
        'gray-light': '#CCCCCC',
        'gray-medium': '#999999',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        'glass-bg': 'rgba(20, 20, 20, 0.6)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #CCCCCC 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0A0A0A 100%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
