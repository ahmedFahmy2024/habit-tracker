/** @type {import('tailwindcss').Config} */
module.exports = {
  // Manual color-scheme control via the theme switch (see src/theme). Required so
  // NativeWind on web doesn't throw "Cannot manually set color scheme".
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Color roles map to the CSS variables defined in src/global.css.
      // Mirror of docs/ui-tokens.md §1 (M3 semantic roles).
      colors: {
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        secondary: "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        tertiary: "var(--tertiary)",
        "on-tertiary": "var(--on-tertiary)",
        error: "var(--error)",
        "on-error": "var(--on-error)",
        "error-container": "var(--error-container)",
        "on-error-container": "var(--on-error-container)",
        background: "var(--background)",
        "on-background": "var(--on-background)",
        surface: "var(--surface)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        "surface-lowest": "var(--surface-container-lowest)",
        "surface-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-high": "var(--surface-container-high)",
        "surface-highest": "var(--surface-container-highest)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
      },
      // Shape scale — docs/ui-tokens.md §3
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
