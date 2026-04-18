/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-main) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        surfaceHover: 'rgb(var(--bg-surface-hover) / <alpha-value>)',
        textMain: 'rgb(var(--text-main) / <alpha-value>)',
        textMuted: 'rgb(var(--text-muted) / <alpha-value>)',
        borderBase: 'rgb(var(--border-base) / 0.1)',
        
        // Domain Colors
        cyber: {
          light: '#00f3ff',
          dark: '#bc13fe',
          DEFAULT: '#00f3ff',
        },
        edtech: {
          light: '#60a5fa',
          dark: '#4f46e5',
          DEFAULT: '#3b82f6',
        },
        health: {
          light: '#34d399',
          dark: '#0f766e',
          DEFAULT: '#10b981',
        },
        fintech: {
          light: '#fcd34d',
          dark: '#0891b2',
          DEFAULT: '#fbbf24',
        },
        sustain: {
          light: '#4ade80',
          dark: '#166534',
          DEFAULT: '#22c55e',
        },
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Rajdhani", "sans-serif"],
      },
      boxShadow: {
        'glow-sm': '0 0 10px var(--color-primary), 0 0 20px var(--color-primary)',
        'glow-md': '0 0 15px var(--color-primary), 0 0 30px var(--color-primary)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [],
}
