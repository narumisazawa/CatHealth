import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4081',
          subtle: '#FFF0F5',
        },
        surface: {
          bg: '#F7F7F7',
          card: '#FFFFFF',
        },
        neutral: {
          main: '#111827',
          body: '#374151',
          muted: '#9CA3AF',
        },
        error: '#EF4444',
      },
      spacing: {
        'page': '16px',
        'tight': '8px',
        'wide': '24px',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
    },
  },
  plugins: [],
}
export default config