const tintColorLight = "#40916c"; // primary-500
const tintColorDark = "#74c69d"; // primary-300

export const ThemeColors = {
  light: {
    text: "#212529", // secondary-800
    background: "#f8f9fa", // secondary-50
    tint: tintColorLight, // primary-500
    icon: "#6c757d", // secondary-500
    tabIconDefault: "#6c757d", // secondary-500
    tabIconSelected: tintColorLight, // primary-500

    // Additional semantic colors
    surface: "#fff", // Pure white for cards
    border: "#dee2e6", // secondary-200
    muted: "#adb5bd", // secondary-400
    accent: "#52b788", // primary-400
    success: "#40916c", // primary-500
    textSecondary: "#495057", // secondary-600
  },
  dark: {
    text: "",
    background: "",
    tint: "",
    icon: "",
    tabIconDefault: "",
    tabIconSelected: "",
  },
};

// export const Fonts = Platform.select({
//   ios: {
//     /** iOS `UIFontDescriptorSystemDesignDefault` */
//     sans: 'system-ui',
//     /** iOS `UIFontDescriptorSystemDesignSerif` */
//     serif: 'ui-serif',
//     /** iOS `UIFontDescriptorSystemDesignRounded` */
//     rounded: 'ui-rounded',
//     /** iOS `UIFontDescriptorSystemDesignMonospaced` */
//     mono: 'ui-monospace',
//   },
//   default: {
//     sans: 'normal',
//     serif: 'serif',
//     rounded: 'normal',
//     mono: 'monospace',
//   },
//   web: {
//     sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//     serif: "Georgia, 'Times New Roman', serif",
//     rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
//     mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
//   },
// });
