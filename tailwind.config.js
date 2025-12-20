/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
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

        // Spiritual Minimalism Theme (Light & Dark)
        'spirit': {
          primary: '#1A1A1A',        // Deep black (light mode)
          'primary-dark': '#F5F5F5', // Off-white (dark mode text)
          accent: '#D4AF37',         // Spiritual gold (same in both modes)
          secondary: '#4A5568',      // Slate gray (light mode)
          'secondary-dark': '#9CA3AF', // Light gray (dark mode)
          bg: '#FFFFFF',             // White (light mode bg)
          'bg-dark': '#0F0F0F',      // Almost black (dark mode bg)
          'bg-secondary': '#F9FAFB', // Light gray (light mode secondary bg)
          'bg-secondary-dark': '#1A1A1A', // Dark gray (dark mode secondary bg)
          'border': '#E5E7EB',       // Light border
          'border-dark': '#2D2D2D',  // Dark border
        },

        // Chakra-inspired category colors (work in both modes)
        'chakra': {
          'root': '#92400E',         // Earth brown - Relationships
          'sacral': '#C2410C',       // Terracotta - Wellness
          'solar': '#D97706',        // Goldenrod - Career
          'heart': '#047857',        // Forest green - Health
          'throat': '#0369A1',       // Ocean blue - Communication
          'third-eye': '#5B21B6',    // Deep purple - Spiritual
          'crown': '#7C3AED',        // Royal purple - Wisdom
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #CCCCCC 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0A0A0A 100%)',
      },
      backdropBlur: {
        'glass': '20px',
        '3xl': '64px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],  // Crimson Text
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
