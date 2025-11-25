import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Image } from "expo-image";
import { formatTime } from "@/src/utils/time";
import { Conversation } from "@/src/types/convex";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

const ConversationItem = ({
  conversation,
  currentUserId,
}: ConversationItemProps) => {
  const otherParticipantId = conversation.participantIds?.find(
    (participantId) => participantId !== currentUserId,
  );

  const otherParticipant = useQuery(
    api.functions.users.getUserById,
    otherParticipantId ? { userId: otherParticipantId } : "skip",
  );

  if (!otherParticipantId || !otherParticipant) {
    return null;
  }

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 bg-transparent border-b  border-secondary-300"
      activeOpacity={0.7}
      onPress={() => router.push(`/(chat)/${conversation._id}`)}
    >
      {/* Avatar */}
      <View className="rounded-full items-center justify-center size-12 bg-primary-100 mr-3 overflow-hidden">
        {otherParticipant.imageUrl ? (
          <Image
            source={otherParticipant.imageUrl}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text className="font-bold text-primary-700 text-lg">
            {otherParticipant.username?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-bold text-base text-gray-900">
            {otherParticipant.username}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatTime(conversation.lastMessageAt)}
          </Text>
        </View>

        <Text
          className="text-sm text-gray-600"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {conversation.lastMessage || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationItem;
