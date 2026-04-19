/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0066cc',
                secondary: '#1e40af',
                accent: '#f97316',
                success: '#10b981',
                danger: '#ef4444',
                warning: '#f59e0b',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
                'md': '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
        },
    },
    plugins: [],
}
