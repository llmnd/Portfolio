import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 80px rgba(12, 17, 43, 0.18)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(96, 165, 250, 0.22), transparent 35%), radial-gradient(circle at 20% 80%, rgba(129, 140, 248, 0.16), transparent 28%)',
      },
      colors: {
        surface: '#f8fafc',
        surfaceDark: '#070b18',
      },
    },
  },
  plugins: [],
};

export default config;
