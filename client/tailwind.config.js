/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Warm ink neutrals — better for reading/writing
        ink: {
          50:  '#fafaf9',
          100: '#f5f4f1',
          200: '#ece9e4',
          300: '#d6d2cb',
          400: '#a89f96',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0f0f0e',
        },
      },
      boxShadow: {
        // Flat, readable shadows — no color tinting
        card:       '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06)',
        modal:      '0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
        'modal-dark': '0 24px 64px rgba(0,0,0,0.5)',
        toolbar:    '0 1px 3px rgba(0,0,0,0.08)',
        msg:        '0 1px 4px rgba(0,0,0,0.08)',
        'msg-sent': '0 2px 8px rgba(79, 70, 229, 0.28)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'fade-out':      'fadeOut 0.3s ease-in forwards',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'slide-in-right':'slideInRight 0.25s ease-out',
        'slide-up':      'slideUp 0.25s ease-out',
        'slide-in':      'slideIn 0.25s ease-out',
        'scale-in':      'scaleIn 0.18s ease-out',
        'pulse-dot':     'pulseDot 2s infinite ease-in-out',
        'shimmer':       'shimmer 1.6s infinite',
        'bounce-in':     'bounceIn 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%':   { opacity: '0', transform: 'scale(0.4)' },
          '50%':  { transform: 'scale(1.04)' },
          '70%':  { transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.75)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
