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
        'neon-cyan': '#00F5FF',
        'neon-purple': '#B026FF',
        'neon-pink': '#FF0080',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        'glass-bg': 'rgba(20, 20, 20, 0.6)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #00F5FF 0%, #B026FF 50%, #FF0080 100%)',
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
