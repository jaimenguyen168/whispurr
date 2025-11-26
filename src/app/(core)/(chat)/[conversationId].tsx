import React from "react";
import { useLocalSearchParams } from "expo-router";
import ConversationView from "@/src/modules/conversation/ui/views/conversation-view";
import { ConversationId } from "@/src/types/convex";

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  return <ConversationView conversationId={conversationId as ConversationId} />;
}
