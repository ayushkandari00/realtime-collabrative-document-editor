/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
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
        // Chat specific colors
        sent: {
          bg: '#4f46e5',
          hover: '#4338ca',
        },
        received: {
          light: '#f1f5f9',
          dark: '#1e293b',
        },
        online: '#22c55e',
        offline: '#94a3b8',
        sidebar: {
          light: '#ffffff',
          dark: '#111827',
        },
        chat: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'typing-dot': 'typingDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(99, 102, 241, 0.12)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.4)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(99, 102, 241, 0.15)',
        msg: '0 1px 4px rgba(0, 0, 0, 0.08)',
        'msg-sent': '0 2px 8px rgba(79, 70, 229, 0.3)',
        sidebar: '4px 0 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
