import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Add design tokens here — do not add ad-hoc classes in components
    },
  },
  plugins: [],
}

export default config
