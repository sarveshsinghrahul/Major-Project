/** @type {import('tailwindcss').Config} */
// The departures-board world (see DESIGN.md): matte flap-black boards in a brushed-steel frame,
// letter-white type, amber for the one thing to act on, signal green for mastered, red for errors.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#2a2d31", // steel frame: the page ground
        surface: "#0b0b0d", // flap black: boards, panels, inputs
        flap: "#16171a", // a single flap cell
        hairline: "#44474d", // rules between rows
        bezel: "#5b5e63", // the steel edge around each board
        ink: { DEFAULT: "#f2f2f2", 2: "#d3d5d8" },
        muted: "#a7aaaf", // steel light
        faint: "#80848b",
        primary: { DEFAULT: "#ffb000", active: "#e69e00", soft: "#2a1f05" }, // amber lamp
        success: { DEFAULT: "#3fcf74", soft: "#0f2618" },
        danger: { DEFAULT: "#ff6166", soft: "#2b0f11" },
        line: {
          sky: "#5fb0ff",
          violet: "#b99cff",
          pink: "#ff7ac6",
          orange: "#ff8a3d",
          teal: "#3ccfc3",
          green: "#7bd66b",
          brown: "#c9a27a",
        },
      },
      fontFamily: {
        sans: ['"Archivo"', "system-ui", "sans-serif"],
      },
      fontSize: {
        title: ["40px", { lineHeight: "1.05", letterSpacing: "0.02em", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.15", letterSpacing: "0.04em", fontWeight: "700" }],
        h3: ["19px", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "600" }],
        dense: ["15px", { lineHeight: "1.4" }],
        eyebrow: ["12px", { lineHeight: "1.3", letterSpacing: "0.12em", fontWeight: "600" }],
      },
      borderRadius: {
        xs: "2px",
        sm: "3px",
        md: "4px",
        lg: "6px",
        xl: "8px",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 8px rgba(0,0,0,0.45)",
        lifted: "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 32px rgba(0,0,0,0.55)",
      },
    },
  },
  plugins: [],
};
