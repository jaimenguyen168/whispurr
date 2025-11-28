const tintColorLight = "#40916c"; // primary-500
const tintColorDark = "#74c69d"; // primary-300

export const ThemeColors = {
  // Primary color scale with descriptive names
  primary: {
    lightest: "#d8f3dc", // 50
    lighter: "#b7e4c7", // 100
    light: "#95d5b2", // 200
    medium: "#74c69d", // 300
    base: "#52b788", // 400
    main: "#40916c", // 500 - main brand color
    dark: "#2d6a4f", // 600
    darker: "#1b4332", // 700
    darkest: "#081c15", // 800
  },

  // Secondary color scale with descriptive names
  secondary: {
    lightest: "#f8f9fa", // 50
    lighter: "#e9ecef", // 100
    light: "#dee2e6", // 200
    medium: "#ced4da", // 300
    base: "#adb5bd", // 400
    main: "#6c757d", // 500
    dark: "#495057", // 600
    darker: "#343a40", // 700
    darkest: "#212529", // 800
  },

  // Theme-specific colors
  light: {
    text: "#212529", // secondary-800
    background: "#f8f9fa", // secondary-50
    tint: tintColorLight, // primary-500
    icon: "#6c757d", // secondary-500
    tabIconDefault: "#6c757d", // secondary-500
    tabIconSelected: tintColorLight, // primary-500
    surface: "#fff", // Pure white for cards
    border: "#dee2e6", // secondary-200
    muted: "#adb5bd", // secondary-400
    accent: "#52b788", // primary-400
    success: "#40916c", // primary-500
    textSecondary: "#495057", // secondary-600
  },

  dark: {
    text: "#f8f9fa", // Light text on dark background
    background: "#212529", // Dark background
    tint: tintColorDark, // primary-300
    icon: "#adb5bd", // Lighter icon color
    tabIconDefault: "#adb5bd", // secondary-400
    tabIconSelected: tintColorDark, // primary-300
    surface: "#343a40", // Dark surface for cards
    border: "#495057", // Dark border
    muted: "#6c757d", // Muted text
    accent: "#74c69d", // primary-300
    success: "#52b788", // primary-400
    textSecondary: "#ced4da", // Light secondary text
  },
};
