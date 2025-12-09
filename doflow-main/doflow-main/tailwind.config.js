/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
    },
    extend: {
      colors: {
        light: {
          bg: '#FDFBF8',
          card: '#FFFFFF',
          cardAlt: '#F6F0E8',
          text: '#1F232E',
          textSecondary: '#5A6072',
          textMuted: '#878B9A',
          border: '#E5DDD2',
        },
        dark: {
          bg: '#FDFBF8',
          card: '#FFFFFF',
          cardAlt: '#F6F0E8',
          text: '#1F232E',
          muted: '#5A6072',
          border: '#E5DDD2',
        },
        brand: {
          primary: '#E06438',
          primaryHover: '#C7542F',
          accent: '#F3A45C',
          accentSoft: '#FFE4CC',
          highlight: '#F8DCC1',
        },
        neutral: {
          sand: '#F9F3EB',
          cloud: '#F4EFE7',
          dusk: '#2F2C28',
        },
        border: {
          subtle: '#E5DDD2',
          bold: '#D4C7BB',
        },
        shadow: {
          soft: 'rgba(47, 44, 40, 0.08)',
        },
      },
      fontFamily: {
        brand: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.72rem + 0.2vw, 0.85rem)',
        'fluid-sm': 'clamp(0.85rem, 0.8rem + 0.25vw, 0.95rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.35vw, 1.15rem)',
        'fluid-lg': 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 1.3rem + 0.8vw, 2rem)',
        'display': 'clamp(2rem, 1.6rem + 1.6vw, 3.5rem)',
      },
      boxShadow: {
        sm: '0 12px 32px rgba(32, 29, 25, 0.06)',
        DEFAULT: '0 24px 60px rgba(32, 29, 25, 0.08)',
        xl: '0 40px 90px rgba(32, 29, 25, 0.12)',
      },
      animation: {
        'soft-fade': 'softFade 0.65s ease-out both',
        'rise-up': 'riseUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'float': 'float 7s ease-in-out infinite',
        'scale-in': 'scaleIn 0.4s ease-out both',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        softFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        riseUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      dropShadow: {
        brand: '0 20px 45px rgba(224, 100, 56, 0.25)',
      },
      backgroundImage: {
        'soft-vignette': 'radial-gradient(circle at top, rgba(240, 170, 110, 0.18), transparent 60%)',
        'soft-grain': 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(rgba(32,29,25,0.03) 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, rgba(240, 170, 110, 0.18), rgba(255, 226, 197, 0.5))',
      },
    },
  },
  plugins: [],
}
