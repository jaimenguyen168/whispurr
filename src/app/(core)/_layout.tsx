import React from "react";
import { Stack } from "expo-router";

export default function CoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(chat)/[conversationId]" />
    </Stack>
  );
}
