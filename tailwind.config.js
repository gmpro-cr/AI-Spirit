/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keep for compatibility)
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

        // Minimalist Black & White Theme
        'spirit': {
          primary: '#000000',        // Pure black
          secondary: '#525252',      // Neutral gray
          bg: '#FFFFFF',             // Pure white
          'bg-secondary': '#FAFAFA', // Off-white
          'bg-tertiary': '#F5F5F5',  // Light gray bg
          'border': '#E5E5E5',       // Light border
          'border-hover': '#D4D4D4', // Border on hover
        },
      },
      boxShadow: {
        // Soft elevation system
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.10)',
        'soft-xl': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'soft-2xl': '0 24px 64px rgba(0, 0, 0, 0.14)',
        // Lifted shadows for hover states
        'lift': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'lift-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        // Glass elevation — inset top highlight simulates edge refraction,
        // outer shadow stays tinted black (no new hues) but softer/wider
        // than the flat soft-* scale so glass reads as floating, not flat.
        'glass-sm': 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 12px rgba(0, 0, 0, 0.06)',
        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': 'inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 0 0 1px rgba(255, 255, 255, 0.45), 0 16px 48px rgba(0, 0, 0, 0.12)',
        'glass-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        'shimmer': 'linear-gradient(90deg, #F5F5F5 0%, #FFFFFF 50%, #F5F5F5 100%)',
      },
      backdropBlur: {
        'glass': '20px',
        '3xl': '64px',
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        display: ['"Crimson Text"', 'serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        wave: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'fadeInUp': 'fadeInUp 0.4s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
