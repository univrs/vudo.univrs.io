import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "vudo-glow": "#e8c25a",
                "vudo-dark": "#080808",
                "vudo-surface": "#0f0f0c",
                mycelium: "#b9a06c",
                "veve-gold": "#f4d77c",
            },
            fontFamily: {
                mono: ["JetBrains Mono", "monospace"],
                display: ["Cinzel Decorative", "Cinzel", "serif"],
                body: ["Cormorant Garamond", "Garamond", "serif"],
                serif: ["Cormorant Garamond", "Garamond", "serif"],
            },
        },
    },
    plugins: [],
} satisfies Config;
