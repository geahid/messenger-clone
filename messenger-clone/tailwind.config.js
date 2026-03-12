/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Exo 2', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      colors: {
        neon: {
          cyan: '#00f5ff',
          purple: '#bf00ff',
          green: '#39ff14',
          pink: '#ff006e',
          orange: '#ff6600',
        },
        game: {
          dark: '#050810',
          panel: '#0a0f1e',
          card: '#0d1528',
          hover: '#111a30',
          border: 'rgba(0,245,255,0.2)',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'message-in-right': 'messageInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'message-in-left': 'messageInLeft 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'fade-up': 'fadeUp 0.25s ease-out',
        'scan': 'scan 3s linear infinite',
      },
    }
  },
  plugins: [],
}