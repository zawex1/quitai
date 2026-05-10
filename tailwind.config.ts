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
        quit: {
          bg: "#0f172a",
          accent: "#22c55e",
          muted: "#94a3b8",
          card: "#1e293b",
        },
      },
      fontSize: {
        base: ["18px", { lineHeight: "1.6" }],
      },
    },
  },
  plugins: [],
};

export default config;
