import React from "react";
import { Stack } from "@/src/components/Stack";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
    </Stack>
  );
}
