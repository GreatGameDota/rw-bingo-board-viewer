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
                shake: {
                    '0%': { transform: 'translate(0px, 0px)' },
                    '12%': { transform: 'translate(8px, -5px)' },
                    '27%': { transform: 'translate(-7px, 9px)' },
                    '41%': { transform: 'translate(10px, 4px)' },
                    '55%': { transform: 'translate(-9px, -6px)' },
                    '70%': { transform: 'translate(5px, 10px)' },
                    '85%': { transform: 'translate(-8px, -4px)' },
                    '100%': { transform: 'translate(0px, 0px)' },
                },
            },
            animation: {
                gradient: 'gradient 2.5s linear infinite',
                shake: 'shake 60s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
