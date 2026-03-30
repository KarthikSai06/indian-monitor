/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: { DEFAULT: '#FF6600', light: '#FF9933', dark: '#CC5200' },
        green: { DEFAULT: '#138808', light: '#1aaa0a', dark: '#0d6606' },
        navy: { DEFAULT: '#000080' },
        card: { DEFAULT: '#12121e', alt: '#1a1a2e' },
        border: 'rgba(255,102,0,0.2)',
      },
      fontFamily: {
        yatra: ['"Yatra One"', 'serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'count-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
        ripple: { '0%': { transform: 'scale(1)', opacity: 0.6 }, '100%': { transform: 'scale(3)', opacity: 0 } },
      },
      animation: {
        'count-up': 'count-up 0.5s ease-out',
        ticker: 'ticker 30s linear infinite',
        blink: 'blink 1.4s ease-in-out infinite',
        ripple: 'ripple 1.5s ease-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
