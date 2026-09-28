/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          'primary-hover': '#4338CA',
          'primary-light': '#EEF2FF',
          secondary: '#1E293B',
          'secondary-light': '#F1F5F9',
          tertiary: '#10B981',
          'tertiary-dark': '#059669',
          'tertiary-light': '#ECFDF5',
          destructive: '#F43F5E',
          'destructive-dark': '#E11D48',
          'destructive-light': '#FFF1F2',
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          'border-dark': '#CBD5E1',
          muted: '#64748B',
          text: '#0F172A',
          'text-body': '#334155'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        hover: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        popover: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        modal: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)'
      }
    },
  },
  plugins: [],
}
