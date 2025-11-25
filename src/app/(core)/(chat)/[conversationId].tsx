import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  return (
    <View>
      <Text>Conversation Screen: `${conversationId}`</Text>
    </View>
  );
}
