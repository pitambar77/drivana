/** Drivana design tokens. Every colour, font and shadow in the app comes from here. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Button classes are composed dynamically (btn-${size}, btn-${variant}), so keep them all.
  safelist: ['btn-sm', 'btn-md', 'btn-lg', 'btn-primary', 'btn-dark', 'btn-secondary', 'btn-ghost', 'btn-danger'],
  theme: {
    extend: {
      colors: {
        // Deep navy primary — used for nav, headings, dark bands
        ink: {
          50: '#F2F5FA',
          100: '#E3E9F3',
          200: '#C5D0E3',
          300: '#97A8C6',
          400: '#6A7FA3',
          500: '#4A5F84',
          600: '#364968',
          700: '#263752',
          800: '#18263D',
          900: '#0F1B2E',
          950: '#09111F',
        },
        // Refined blue accent — buttons, links, active states
        accent: {
          50: '#EEF3FF',
          100: '#DCE6FF',
          200: '#B9CCFF',
          300: '#8CAAFB',
          400: '#5E84F3',
          500: '#3D66E8',
          600: '#2A50D2',
          700: '#2240AB',
          800: '#1E3787',
          900: '#1C306B',
        },
        // Cool, slightly blue-biased neutrals
        mist: {
          0: '#FFFFFF',
          50: '#F6F8FB',
          100: '#EEF1F6',
          200: '#E1E6EE',
          300: '#CBD3DF',
          400: '#9AA6B8',
          500: '#6E7B90',
          600: '#525E72',
          700: '#3C4657',
          800: '#272F3C',
          900: '#1A202A',
        },
        ok: { 50: '#ECFBF3', 100: '#D3F5E3', 600: '#13874F', 700: '#0D6B3E' },
        warn: { 50: '#FFF8EB', 100: '#FEEDC8', 600: '#B66A05', 700: '#8F5205' },
        bad: { 50: '#FEF1F1', 100: '#FCDCDC', 600: '#C9302C', 700: '#A12320' },
        info: { 50: '#EEF6FF', 100: '#D8EAFF', 600: '#1769C2', 700: '#11549C' },
      },
      fontFamily: {
        display: ['Archivo', 'Figtree', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,46,0.04), 0 1px 3px rgba(15,27,46,0.06)',
        lift: '0 4px 12px -2px rgba(15,27,46,0.08), 0 12px 32px -8px rgba(15,27,46,0.12)',
        pop: '0 20px 48px -12px rgba(15,27,46,0.28)',
        focus: '0 0 0 3px rgba(61,102,232,0.28)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-up': { from: { opacity: 0.001, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        'fade-up': 'fade-up .25s ease-out both',
        'slide-in': 'slide-in .22s ease-out both',
      },
    },
  },
  plugins: [],
};
