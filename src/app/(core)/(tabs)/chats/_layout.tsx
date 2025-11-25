import React from "react";
import { Stack } from "@/src/components/Stack";

export default function ChatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
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
            backgroundColor: "#fff",
          },
        }}
      />
    </Stack>
  );
}
