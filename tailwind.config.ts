import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      height: {
        header: "var(--header-height)",
        switcher: "var(--switcher-height)",
        "header-and-switcher": "var(--header-and-switcher-height)",
      },
      spacing: {
        header: "var(--header-height)",
        switcher: "var(--switcher-height)",
        "header-and-switcher": "var(--header-and-switcher-height)",
      },
      inset: {
        header: "var(--header-height)",
        switcher: "var(--switcher-height)",
        "header-and-switcher": "var(--header-and-switcher-height)",
      },
      backgroundColor: {
        primary: "var(--foreground-rgb)",
      },
      fontFamily: {
        noto: ["var(--font-noto-sans-mono)", "var(--font-noto-sans-tc)"],
      },
    },
  },
  plugins: [],
};
export default config;
