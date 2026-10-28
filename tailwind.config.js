/** AutoDealer design tokens. Every colour, font and shadow in the app comes from here. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Button classes are composed dynamically (btn-${size}, btn-${variant}), so keep them all.
  safelist: ['btn-sm', 'btn-md', 'btn-lg', 'btn-primary', 'btn-dark', 'btn-secondary', 'btn-ghost', 'btn-danger'],
  theme: {
    extend: {
      colors: {
        // AutoDealer slate — from the logo's "Dealer" lettering (#14232A) and the hero band (#13282D)
        ink: {
          50: '#F1F5F6',
          100: '#DFE8EA',
          200: '#BFD0D4',
          300: '#93AEB4',
          400: '#648891',
          500: '#476A73',
          600: '#36535B',
          700: '#29424A',
          800: '#1C3238',
          900: '#13282D',
          950: '#0C1A1E',
        },
        // AutoDealer red — the logo's "Auto" and chevron (#E8201C). Buttons, links, active states.
        accent: {
          50: '#FEF2F1',
          100: '#FDE1DF',
          200: '#FBC3BF',
          300: '#F7958F',
          400: '#F15856',
          500: '#EE3330',
          600: '#E8201C',
          700: '#C21815',
          800: '#9E1714',
          900: '#7F1916',
        },
        // AutoDealer yellow — the logo's lower chevron (#F8D000). Highlights only.
        sun: {
          50: '#FFFBE6',
          100: '#FFF3B8',
          300: '#FFE15C',
          400: '#FBD71F',
          500: '#F8D000',
          600: '#D6A800',
          700: '#A87F00',
        },
        // Warm neutrals to sit with the off-white page (#FAF9F5)
        mist: {
          0: '#FFFFFF',
          50: '#FAF9F5',
          100: '#F2F1EC',
          200: '#E5E3DC',
          300: '#D1CEC5',
          400: '#A29E94',
          500: '#747067',
          600: '#57544C',
          700: '#403E38',
          800: '#2B2A26',
          900: '#1C1B19',
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
        card: '0 1px 2px rgba(19,40,45,0.04), 0 1px 3px rgba(19,40,45,0.06)',
        lift: '0 4px 12px -2px rgba(19,40,45,0.08), 0 12px 32px -8px rgba(19,40,45,0.12)',
        pop: '0 20px 48px -12px rgba(19,40,45,0.28)',
        focus: '0 0 0 3px rgba(232,32,28,0.25)',
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
