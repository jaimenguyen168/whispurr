import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Image } from "expo-image";
import { formatTime } from "@/src/utils/time";
import { ConversationWithDetails } from "@/src/types/convex";
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
import { scheduleOnRN } from "react-native-worklets";
import SwipeAction from "@/src/components/SwipeAction";
import { decryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useConversationKey } from "@/src/hooks/useConversationKey";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  clerkUserId: string;
}

const THRESHOLD = 50;

const ConversationItem = ({
  conversation,
  currentUserId,
  clerkUserId,
}: ConversationItemProps) => {
  const reanimatedRef = useRef<SwipeableMethods>(null);
  const heightAnim = useSharedValue(80);
  const opacityAnim = useSharedValue(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [decryptedLastMessage, setDecryptedLastMessage] = useState("");

  const conversationKey = useConversationKey(conversation._id);

  const otherParticipantRecord = conversation.allParticipants?.find(
    (participant) => participant.userId !== currentUserId,
  );
  const otherParticipantId = otherParticipantRecord?.userId;

  const otherParticipant = useQuery(
    api.functions.users.getUserById,
    otherParticipantId ? { userId: otherParticipantId } : "skip",
  );

  // Fetch the last message to get its iv
  const messages = useQuery(api.functions.messages.getMessagesForConversation, {
    conversationId: conversation._id,
  });
  const lastMessage = messages?.[messages.length - 1];

  const deleteConversation = useMutation(
    api.functions.conversations.leaveConversation,
  );

  useEffect(() => {
    const decryptLastMessage = async () => {
      if (!conversationKey) return;

      if (!lastMessage?.content || !lastMessage?.iv) {
        setDecryptedLastMessage("");
        return;
      }

      try {
        const decrypted = await decryptMessage(
          lastMessage.content,
          conversationKey,
          lastMessage.iv,
        );
        setDecryptedLastMessage(decrypted);
      } catch (error) {
        console.error("[ConversationItem] Decrypt error:", error);
        setDecryptedLastMessage("Unable to decrypt message");
      }
    };

    decryptLastMessage();
  }, [lastMessage?._id, lastMessage?.iv, conversationKey]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: heightAnim.value,
      opacity: opacityAnim.value,
    };
  });

  // Extracted delete logic
  const executeDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      await deleteConversation({ conversationId: conversation._id });
      console.log("Conversation deleted successfully");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      heightAnim.value = withTiming(80, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      opacityAnim.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
      setIsDeleting(false);
      reanimatedRef.current?.close();
    }
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete this conversation with ${otherParticipant?.username}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Close the swipeable when cancelled
            reanimatedRef.current?.close();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Start the delete animation
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
              (finished) => {
                if (finished) {
                  scheduleOnRN(executeDelete);
                }
              },
            );
          },
        },
      ],
    );
  };

  const onSwipeableOpen = () => {
    showDeleteConfirmation();
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

  if (!otherParticipantId || !otherParticipant || isDeleting) {
    return null;
  }

  return (
    <Reanimated.View style={animatedStyle}>
      <ReanimatedSwipeable
        ref={reanimatedRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={THRESHOLD}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
      >
        <TouchableOpacity
          className="flex-row items-center py-2 px-6 bg-transparent"
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
              <Text className="font-bold text-base text-main">
                {otherParticipant.username}
              </Text>
              <Text className="text-xs text-muted">
                {formatTime(conversation.lastMessageAt)}
              </Text>
            </View>

            <Text
              className="text-sm text-secondary"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {decryptedLastMessage || "No messages yet"}
            </Text>
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </Reanimated.View>
  );
};

export default ConversationItem;
