import React from "react";
import { Stack } from "@/src/components/Stack";
import { ThemeColors } from "@/src/constants/ThemeColors";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="login"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [1.0],
          headerShadowVisible: false,
          sheetGrabberVisible: false,
          contentStyle: {
            backgroundColor: ThemeColors.secondary.lightest,
          },
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [1.0],
          headerShadowVisible: false,
          sheetGrabberVisible: false,
          contentStyle: {
            backgroundColor: ThemeColors.secondary.lightest,
          },
        }}
      />
    </Stack>
  );
}
