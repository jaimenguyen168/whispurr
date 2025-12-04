import React from "react";
import { Stack } from "expo-router";
import { useThemeColors } from "@/src/providers/ThemeProvider";

export default function CoreLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.surface,
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)/[conversationId]" />
    </Stack>
  );
}
