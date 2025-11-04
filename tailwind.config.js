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
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        shimmer: 'shimmer 3s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth': 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}
