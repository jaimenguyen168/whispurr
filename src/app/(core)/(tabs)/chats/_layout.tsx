import React from "react";
import { Stack } from "@/src/components/Stack";
import { useThemeColors } from "@/src/providers/ThemeProvider";

export default function ChatsLayout() {
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
      <Stack.Screen
        name="add-conversation"
        options={{
          presentation: "formSheet",
          headerShadowVisible: false,
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </Stack>
  );
}
