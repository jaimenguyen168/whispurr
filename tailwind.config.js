/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#d8f3dc",
          100: "#b7e4c7",
          200: "#95d5b2",
          300: "#74c69d",
          400: "#52b788",
          500: "#40916c",
          600: "#2d6a4f",
          700: "#1b4332",
          800: "#081c15",
        },
        secondary: {
          50: "#f8f9fa",
          100: "#e9ecef",
          200: "#dee2e6",
          300: "#ced4da",
          400: "#adb5bd",
          500: "#6c757d",
          600: "#495057",
          700: "#343a40",
          800: "#212529",
        },
      },
      fontFamily: {
        sans: ["Nunito_400Regular"],
        extralight: ["Nunito_200ExtraLight"],
        light: ["Nunito_300Light"],
        medium: ["Nunito_500Medium"],
        semibold: ["Nunito_600SemiBold"],
        bold: ["Nunito_700Bold"],
        extrabold: ["Nunito_800ExtraBold"],
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Background utilities
        ".bg-app": {
          backgroundColor: theme("colors.secondary.50"), // #f8f9fa
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.secondary.800"), // #212529
          },
        },
        ".bg-card": {
          backgroundColor: "#ffffff",
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.secondary.700"), // #343a40
          },
        },
        ".bg-surface": {
          backgroundColor: theme("colors.secondary.100"), // #e9ecef
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.secondary.600"), // #495057
          },
        },

        // Text utilities
        ".text-main": {
          color: theme("colors.secondary.800"), // #212529
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.secondary.50"), // #f8f9fa
          },
        },
        ".text-secondary": {
          color: theme("colors.secondary.600"), // #495057
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.secondary.300"), // #ced4da
          },
        },
        ".text-muted": {
          color: theme("colors.secondary.400"), // #adb5bd
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.secondary.500"), // #6c757d
          },
        },

        // Border utilities
        ".border-soft": {
          borderColor: theme("colors.secondary.200"), // #dee2e6
          "@media (prefers-color-scheme: dark)": {
            borderColor: theme("colors.secondary.600"), // #495057
          },
        },
        ".border-divider": {
          borderColor: theme("colors.secondary.200"), // #dee2e6
          "@media (prefers-color-scheme: dark)": {
            borderColor: theme("colors.secondary.700"), // #343a40
          },
        },

        // Icon utilities
        ".text-icon": {
          color: theme("colors.secondary.500"), // #6c757d
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.secondary.400"), // #adb5bd
          },
        },

        // Primary accent utilities
        ".text-accent": {
          color: theme("colors.primary.500"), // #40916c
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.primary.300"), // #74c69d
          },
        },
        ".bg-accent": {
          backgroundColor: theme("colors.primary.500"), // #40916c
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: theme("colors.primary.400"), // #52b788
          },
        },

        // Tab utilities
        ".text-tab-default": {
          color: theme("colors.secondary.500"), // #6c757d
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.secondary.400"), // #adb5bd
          },
        },
        ".text-tab-selected": {
          color: theme("colors.primary.500"), // #40916c
          "@media (prefers-color-scheme: dark)": {
            color: theme("colors.primary.300"), // #74c69d
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
