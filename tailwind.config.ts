import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1931',
          900: '#0A1931',
          800: '#0F2444',
          700: '#14305C',
        },
        electric: {
          DEFAULT: '#185ADB',
          600: '#144FB8',
          50: '#EBF2FD',
          100: '#D6E5FB',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(24, 90, 219, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        blink: 'blink 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
