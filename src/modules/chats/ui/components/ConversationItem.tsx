import { View, Text, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Image } from "expo-image";
import { formatTime } from "@/src/utils/time";
import { Conversation } from "@/src/types/convex";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import SwipeAction from "@/src/components/SwipeAction";
import { scheduleOnRN } from "react-native-worklets";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

const THRESHOLD = 50;

const ConversationItem = ({
  conversation,
  currentUserId,
}: ConversationItemProps) => {
  const reanimatedRef = useRef<SwipeableMethods>(null);
  const heightAnim = useSharedValue(80);
  const opacityAnim = useSharedValue(1);

  const otherParticipantId = conversation.participantIds?.find(
    (participantId) => participantId !== currentUserId,
  );

  const otherParticipant = useQuery(
    api.functions.users.getUserById,
    otherParticipantId ? { userId: otherParticipantId } : "skip",
  );

  const deleteConversation = useMutation(
    api.functions.conversations.deleteConversation,
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightAnim.value,
      opacity: opacityAnim.value,
    };
  });

  const onSwipeableOpen = () => {
    heightAnim.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    opacityAnim.value = withTiming(
      0,
      {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        scheduleOnRN(() => {
          deleteConversation({ conversationId: conversation._id });
        });
      },
    );
  };

  const renderRightActions = (
    progress: SharedValue<number>,
    translation: SharedValue<number>,
    swipeableMethods: SwipeableMethods,
  ) => {
    return (
      <SwipeAction threshold={THRESHOLD} prog={progress} drag={translation} />
    );
  };

  if (!otherParticipantId || !otherParticipant) {
    return null;
  }

  return (
    <Reanimated.View style={animatedStyle}>
      <ReanimatedSwipeable
        ref={reanimatedRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={onSwipeableOpen}
      >
        <TouchableOpacity
          className="flex-row items-center py-3 px-6 bg-white"
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
              <Text className="font-bold text-base text-primary-800">
                {otherParticipant.username}
              </Text>
              <Text className="text-xs text-secondary-400">
                {formatTime(conversation.lastMessageAt)}
              </Text>
            </View>

            <Text
              className="text-sm text-secondary-500"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {conversation.lastMessage || "No messages yet"}
            </Text>
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </Reanimated.View>
  );
};

export default ConversationItem;
