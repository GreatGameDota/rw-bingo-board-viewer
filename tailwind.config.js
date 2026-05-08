/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                gradient: {
                    '0%': { backgroundPosition: '100% 0%' },
                    '100%': { backgroundPosition: '-50% 0%' },
                },
            },
            animation: {
                gradient: 'gradient 2.5s linear infinite',
            },
        },
    },
    plugins: [],
}
