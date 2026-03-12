/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          light: '#ffffff',
          muted: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
        'message-in-right': 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'message-in-left': 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' }},
        fadeUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' }},
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 }},
        messageInRight: { from: { opacity: 0, transform: 'translateX(12px) scale(0.95)' }, to: { opacity: 1, transform: 'translateX(0) scale(1)' }},
        messageInLeft: { from: { opacity: 0, transform: 'translateX(-12px) scale(0.95)' }, to: { opacity: 1, transform: 'translateX(0) scale(1)' }},
      }
    }
  },
  plugins: [],
}
