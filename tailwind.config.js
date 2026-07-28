/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // ── eSparkOS Design System tokens ──────────────────────
        primary: {
          DEFAULT: '#d97706',   // --theme-mustard
          hover:   '#b45309',   // --theme-terracotta
          light:   '#fef3c7',   // warm tint for icon bg
        },
        sidebar: {
          DEFAULT: '#faf7f2',   // --theme-sidebar-bg
          hover:   '#f5f1eb',   // --theme-sidebar-hover
          border:  '#e8e2d9',   // --theme-linen
          text:    '#78716c',   // --theme-taupe
          active:  '#d97706',   // --theme-mustard
        },
        ds: {
          parchment: '#fdfbf7', // --theme-parchment  (page bg)
          cream:     '#ffffff', // --theme-cream
          linen:     '#faf7f2', // --theme-sidebar-bg (card surface)
          border:    '#e8e2d9', // --theme-linen      (borders)
          aubergine: '#3c2a21', // --theme-aubergine  (primary text)
          taupe:     '#78716c', // --theme-taupe      (muted text)
          claret:    '#92400e', // --theme-claret
          mustard:   '#d97706', // --theme-mustard
          terracotta:'#b45309', // --theme-terracotta
        },
        // keep semantic aliases used across the app
        surface: '#fdfbf7',
        heading: '#3c2a21',
        body:    '#78716c',
        border:  '#e8e2d9',
        success: '#22C55E',
        warning: '#d97706',
        danger:  '#EF4444',
      },
      boxShadow: {
        // DS: tinted low-elevation shadows
        card:        '0 1px 3px 0 rgba(60,42,33,0.06), 0 1px 2px -1px rgba(60,42,33,0.04)',
        'card-hover':'0 6px 20px 0 rgba(60,42,33,0.10)',
        modal:       '0 20px 60px -10px rgba(60,42,33,0.20)',
        topbar:      '0 1px 0 0 #e8e2d9',
      },
      borderRadius: {
        DEFAULT: '8px',    // radius-button
        sm:  '4px',        // radius-subtle
        md:  '6px',        // radius-button-sm
        lg:  '8px',
        xl:  '12px',
        '2xl': '24px',     // radius-card (pill / large card)
        '3xl': '32px',     // radius-card-lg
        full: '9999px',
      },
      maxWidth: {
        container: '1280px',
      },
      letterSpacing: {
        heading: '0.45px',  // DS heading letter-spacing
      },
    },
  },
  plugins: [],
}