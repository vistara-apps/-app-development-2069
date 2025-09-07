/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: 'hsl(200, 80%, 50%)',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          500: 'hsl(40, 90%, 55%)',
        },
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(200, 20%, 95%)',
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(200, 50%, 30%, 0.1)',
      }
    },
  },
  plugins: [],
}