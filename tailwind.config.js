// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nobel: "#a1a1a1",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#FFFFFF",
            a: {
              color: "#1E40AF",
              "&:hover": {
                color: "#1D4ED8",
              },
            },
            h1: {
              color: "#FFFFFF",
            },
            h2: {
              color: "#FFFFFF",
            },
            h3: {
              color: "#FFFFFF",
            },
            strong: {
              color: "#FFFFFF",
            },
            blockquote: {
              color: "#FFFFFF",
            },
            code: {
              color: "#FFFFFF",
              backgroundColor: "#1E1E1E",
              padding: "0.2em 0.4em",
              borderRadius: "0.3em",
            },
            pre: {
              color: "#FFFFFF",
              backgroundColor: "#1E1E1E",
              padding: "1em",
              borderRadius: "0.3em",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
