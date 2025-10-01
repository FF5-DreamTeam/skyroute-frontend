/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        main: {
          DEFAULT: '#BBD8D8',
          light: '#D4E8E8',
          dark: '#A8C8C8',
        },
        accent: {
          1: '#798686',
          2: '#5D5D5D',
          3: '#F7A34F',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#D9D9D9',
        },
        text: {
          DEFAULT: '#000000',
        },  
        primary: {
          DEFAULT: '#BBD8D8',
          50: '#F0F8F8',
          100: '#D4E8E8',
          200: '#BBD8D8',
          300: '#A8C8C8',
          400: '#95B8B8',
          500: '#82A8A8',
          600: '#6F9898',
          700: '#5C8888',
          800: '#497878',
          900: '#366868',
        },
        secondary: {
          DEFAULT: '#798686',
          50: '#F5F6F6',
          100: '#E8EAEA',
          200: '#D4D7D7',
          300: '#C0C4C4',
          400: '#ACB1B1',
          500: '#989E9E',
          600: '#798686',
          700: '#5A5E5E',
          800: '#3B3E3E',
          900: '#1C1E1E',
        },
        warning: {
          DEFAULT: '#F7A34F',
          50: '#FEF7ED',
          100: '#FDEED6',
          200: '#FBDDAD',
          300: '#F9CC84',
          400: '#F7BB5B',
          500: '#F7A34F',
          600: '#E6943A',
          700: '#D58525',
          800: '#C47610',
          900: '#B36700',
        },
        success: '#10B981',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Roboto', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'custom-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'custom-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'custom-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
      },
      borderRadius: {
        'custom-sm': '0.25rem',
        'custom-md': '0.5rem',
        'custom-lg': '0.75rem',
        'custom-xl': '1rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-85': '85vh',
        'screen-90': '90vh',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-responsive-xs': {
          '@apply text-xs sm:text-sm': {},
        },
        '.text-responsive-sm': {
          '@apply text-sm sm:text-base': {},
        },
        '.text-responsive-base': {
          '@apply text-base sm:text-lg': {},
        },
        '.text-responsive-lg': {
          '@apply text-lg sm:text-xl': {},
        },
        '.text-responsive-xl': {
          '@apply text-xl sm:text-2xl': {},
        },
        '.text-responsive-2xl': {
          '@apply text-2xl sm:text-3xl lg:text-4xl': {},
        },
        '.text-responsive-3xl': {
          '@apply text-3xl sm:text-4xl lg:text-5xl': {},
        },
        '.text-responsive-4xl': {
          '@apply text-4xl sm:text-5xl lg:text-6xl': {},
        },
        '.container-responsive': {
          '@apply container mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.grid-responsive': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6': {},
        },
        '.grid-responsive-2': {
          '@apply grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6': {},
        },
        '.grid-responsive-3': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6': {},
        },
        '.flex-responsive': {
          '@apply flex flex-col sm:flex-row gap-4 sm:gap-6': {},
        },
        '.card-responsive': {
          '@apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6': {},
        },
        '.card-responsive-hover': {
          '@apply card-responsive transition-all duration-200 hover:shadow-md hover:-translate-y-1': {},
        },
        '.btn-responsive': {
          '@apply px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200': {},
        },
        '.input-responsive': {
          '@apply w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent': {},
        },
        '.show-mobile': {
          '@apply block sm:hidden': {},
        },
        '.show-tablet': {
          '@apply hidden sm:block lg:hidden': {},
        },
        '.show-desktop': {
          '@apply hidden lg:block': {},
        },
        '.hide-mobile': {
          '@apply hidden sm:block': {},
        },
        '.hide-tablet': {
          '@apply block sm:hidden lg:block': {},
        },
        '.hide-desktop': {
          '@apply block lg:hidden': {},
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
