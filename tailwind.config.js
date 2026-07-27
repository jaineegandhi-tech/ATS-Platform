/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          DEFAULT: '#2563EB',
          hover:   '#1D4ED8',
          light:   '#EFF6FF',
        },
        sidebar: {
          DEFAULT: '#111827',
          hover:   '#1F2937',
          border:  '#1F2937',
          text:    '#9CA3AF',
          active:  '#2563EB',
        },
        surface: '#F9FAFB',
        heading: '#111827',
        body:    '#6B7280',
        border:  '#F3F4F6',
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      boxShadow: {
        card:        '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'card-hover':'0 4px 16px 0 rgb(0 0 0 / 0.08)',
        modal:       '0 20px 60px -10px rgb(0 0 0 / 0.18)',
        topbar:      '0 1px 0 0 #F3F4F6',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      maxWidth: {
        container: '1280px',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
}