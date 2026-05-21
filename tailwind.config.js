/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans:    ['Manrope', 'system-ui', 'sans-serif'],
                mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
                serif:   ['Cormorant Garamond', 'Georgia', 'serif'],
                display: ['Cormorant Garamond', 'Georgia', 'serif'],
            },
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                highlight:  'var(--highlight)',
                card: {
                    DEFAULT:    'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                primary: {
                    DEFAULT:    'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                muted: {
                    DEFAULT:    'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                border: 'var(--border)',
                input:  'var(--input)',
                ring:   'var(--ring)',
            },
            borderColor: {
                DEFAULT: 'var(--border)',
                border:  'var(--border)',
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                sm:      'var(--radius-sm)',
                lg:      'var(--radius)',
                xl:      'var(--radius)',
                '2xl':   'var(--radius-lg)',
            },
            boxShadow: {
                'card':  '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
                'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
                'soft':  '0 2px 12px rgba(0,0,0,0.06)',
            },
            animation: {
                ticker:         'ticker 40s linear infinite',
                'pulse-dot':    'pulse-dot 2s ease-out infinite',
                'fade-in-up':   'fadeInUp 0.6s ease-out forwards',
            },
            keyframes: {
                ticker: {
                    from: { transform: 'translateX(0)' },
                    to:   { transform: 'translateX(-50%)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to:   { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
