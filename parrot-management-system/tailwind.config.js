/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          sage: '#9CAF88',
          dustyRose: '#C8A6A2',
          slate: '#6D7A8D',
          cream: '#F5F4F0',
          stone: '#A89994',
          mist: '#D4D4D8',
          ash: '#8B8C89',
          blush: '#E6D4D1',
          tea: '#BEB5A2',
          cloud: '#F9F8F6',
        }
      },
      backgroundColor: {
        'morandi-primary': 'var(--morandi-sage)',
        'morandi-secondary': 'var(--morandi-slate)',
        'morandi-accent': 'var(--morandi-dusty-rose)',
        'morandi-surface': 'var(--morandi-cloud)',
        'morandi-background': 'var(--morandi-cream)',
      },
      textColor: {
        'morandi-primary': 'var(--morandi-sage)',
        'morandi-secondary': 'var(--morandi-slate)',
        'morandi-accent': 'var(--morandi-dusty-rose)',
        'morandi-ash': 'var(--morandi-ash)',
      },
      borderColor: {
        'morandi-primary': 'var(--morandi-sage)',
        'morandi-secondary': 'var(--morandi-slate)',
        'morandi-mist': 'var(--morandi-mist)',
      },
      boxShadow: {
        'morandi': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'morandi-lg': '0 4px 6px rgba(0, 0, 0, 0.07)',
      }
    },
  },
  plugins: [],
}
