import React from "react";
import { Stack } from "@/src/components/Stack";
import { useThemeColors } from "@/src/providers/ThemeProvider";

export default function ProfileLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="friends" />
    </Stack>
  );
}
