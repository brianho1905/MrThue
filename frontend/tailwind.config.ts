import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa",
        foreground: "#2b3437",
        primary: "#0056d2",
        "primary-dim": "#004bb9",
        "on-primary": "#f8f7ff",
        "on-surface": "#2b3437",
        "on-surface-variant": "#586064",
        "surface-container-low": "#f1f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e2e9ec",
        "surface-container-highest": "#dbe4e7",
        "primary-container": "#dae2ff",
        "on-primary-container": "#004ab7",
        "secondary-container": "#d6e3fb",
        "on-secondary-container": "#465365",
        "outline-variant": "#abb3b7",
        "primary-fixed-dim": "#c6d3ff",
      },
      fontFamily: {
        headline: ["var(--font-headline)", "Manrope", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(43, 52, 55, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
