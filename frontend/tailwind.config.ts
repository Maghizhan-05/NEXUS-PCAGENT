import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Web-shooter HUD: midnight suit-black base. Blue = calm/healthy,
        // red = spider-sense (alerts, elevated load, interaction).
        web: {
          void: "#080b16",
          panel: "#0d1327",
          plate: "#111a35",
          line: "#20305c",
          hair: "#16223f",
          text: "#e8eeff",
          mute: "#7a88ab",
          faint: "#47526f",
          blue: "#2f6bff",
          bluedim: "#1b3a86",
          red: "#e5142a",
          reddim: "#7a1520",
          amber: "#f0a92e",
          silver: "#aab7d6",
        },
        // Back-compat aliases so existing components inherit the new palette.
        nexus: {
          bg: "#080b16",
          surface: "#0d1327",
          raised: "#111a35",
          line: "#20305c",
          hair: "#16223f",
          text: "#e8eeff",
          mute: "#7a88ab",
          faint: "#47526f",
          cyan: "#2f6bff",
          cyandim: "#1b3a86",
          red: "#e5142a",
          amber: "#f0a92e",
          green: "#2f6bff",
        },
      },
      fontFamily: {
        display: ["Oswald", "Impact", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
      },
      letterSpacing: {
        widest2: "0.3em",
      },
      keyframes: {
        thwip: {
          "0%": { transform: "scale(0.2)", opacity: "0.9" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        senseP: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "0.7" },
        },
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        thwip: "thwip 0.5s ease-out forwards",
        senseP: "senseP 1.4s ease-in-out infinite",
        sweep: "sweep 6s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
