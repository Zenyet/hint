/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Apple-inspired custom animations
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
      // Apple-style backdrop blur
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      const thumb = theme('colors.gray.400');
      const track = theme('colors.gray.200');
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
        '.scrollbar-xy': {
          'scrollbar-width': 'thin',
          'scrollbar-color': `${thumb} ${track}`,
        },
        '.scrollbar-xy::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.scrollbar-xy::-webkit-scrollbar-track': {
          background: track,
        },
        '.scrollbar-xy::-webkit-scrollbar-thumb': {
          background: thumb,
          'border-radius': '9999px',
          border: `2px solid ${track}`,
        },
        '.scrollbar-xy::-webkit-scrollbar-thumb:hover': {
          background: theme('colors.gray.500'),
        },
      });
    }
  ],
  darkMode: 'media',
}
