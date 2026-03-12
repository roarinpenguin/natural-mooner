/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#1e1e24',
        'bg-panel': '#25252d',
        'bg-elevated': '#2c2538',
        'primary': '#8b5cf6',
        'primary-hover': '#7c3aed',
        'primary-soft': '#c4b5fd',
        'primary-glow': '#6d28d9',
        'text-main': '#e2e8f0',
        'text-muted': '#94a3b8',
      },
      boxShadow: {
        'neu-out': '6px 6px 12px #19191e, -6px -6px 12px #2f2f38',
        'neu-in': 'inset 6px 6px 12px #19191e, inset -6px -6px 12px #2f2f38',
        'neu-btn': '4px 4px 8px #19191e, -4px -4px 8px #2f2f38',
        'neu-btn-active': 'inset 4px 4px 8px #19191e, inset -4px -4px 8px #2f2f38',
        'neu-purple': '8px 8px 20px rgba(10, 8, 18, 0.85), -8px -8px 20px rgba(75, 55, 120, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.12), 0 0 24px rgba(139, 92, 246, 0.10)',
        'neu-purple-in': 'inset 6px 6px 14px rgba(14, 10, 22, 0.92), inset -6px -6px 14px rgba(70, 50, 112, 0.18), inset 0 0 0 1px rgba(139, 92, 246, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
