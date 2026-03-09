export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0C0A',
        paper: '#FAF8F5',
        cream: '#F2EDE6',
        'warm-grey': '#E8E2DA',
        'mid-grey': '#A89F94',
        copper: { DEFAULT: '#B5651D', light: '#D4854A', pale: '#F5E6D8' },
        forest: { DEFAULT: '#2D4A35', light: '#4A7A57' },
        rose: { DEFAULT: '#C4705A', pale: '#F5E2DC' },
        gold: { DEFAULT: '#C9A84C', pale: '#FBF2DC' },
        brand: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
