import type { Config } from 'tailwindcss';
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] }, colors: { ink: '#070A12', brand: { 500: '#6C5CE7', 600: '#5547D7' } }, boxShadow: { glass: '0 24px 80px rgba(15, 23, 42, 0.14)' } } },
  plugins: []
} satisfies Config;
