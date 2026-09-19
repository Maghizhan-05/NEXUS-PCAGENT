import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#05070a",
          panel: "#0a0e14",
          line: "#16202c",
          cyan: "#22d3ee",
          cyandim: "#0e7490",
          white: "#e6f1f5",
          mute: "#5b6b78",
          amber: "#f5b642",
          red: "#f04a4a",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'SF Mono'", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,211,238,0.15)",
        glowstrong: "0 0 30px rgba(34,211,238,0.35)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        scan: "scan 6s linear infinite",
        flicker: "flicker 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
