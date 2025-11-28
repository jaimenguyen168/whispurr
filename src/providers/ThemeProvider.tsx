import React, { createContext, useContext, useEffect, useState } from "react";
import { colorScheme, useColorScheme } from "nativewind";
import { createMMKV } from "react-native-mmkv";
import { ThemeColors } from "@/src/constants/ThemeColors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create MMKV instance
const storage = createMMKV();

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const { colorScheme: systemColorScheme } = useColorScheme();

  const isDark =
    theme === "system" ? systemColorScheme === "dark" : theme === "dark";

  // Load saved theme preference on app start
  useEffect(() => {
    try {
      const savedTheme = storage.getString("theme-preference");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);

        // Apply the theme immediately
        if (savedTheme !== "system") {
          colorScheme.set(savedTheme as "light" | "dark");
        }
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
    }
  }, []);

  useEffect(() => {
    if (theme === "system") {
      colorScheme.set(systemColorScheme as ThemeMode);
    } else {
      colorScheme.set(theme);
    }
  }, [theme, systemColorScheme]);

  const setTheme = (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      storage.set("theme-preference", newTheme);

      if (newTheme === "system") {
        colorScheme.set(systemColorScheme as ThemeMode);
      } else {
        colorScheme.set(newTheme);
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useThemeColors = () => {
  const { isDark } = useTheme();
  return isDark ? ThemeColors.dark : ThemeColors.light;
};
