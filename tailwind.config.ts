import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'vudo-glow': '#00ff88',
        'vudo-dark': '#0a0a0f',
        'vudo-surface': '#12121a',
        'mycelium': '#8b5cf6',
        'veve-gold': '#fbbf24',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
