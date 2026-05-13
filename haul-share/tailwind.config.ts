import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#fafaf7',
        surface: '#f2ede4',
        border: '#ddd8cf',
        primary: {
          DEFAULT: '#7a9e76',
          hover: '#6a8c66',
        },
        text: '#3d3529',
        muted: '#8a7e72',
        price: '#b07d4a',
        'badge-bg': '#e8f0e6',
        danger: '#c97b7b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(61, 53, 41, 0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
