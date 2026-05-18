import { View, Text, Alert, Pressable, Dimensions } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { formatTime } from "@/src/utils/time";
import { ConversationWithDetails } from "@/src/types/convex";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { decryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useConversationKey } from "@/src/hooks/useConversationKey";
import ConversationContextModal, {
  ConversationContextAction,
} from "@/src/modules/chats/ui/components/ConversationContextModal";
import ReportModal from "@/src/modules/conversation/ui/components/ReportModal";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  clerkUserId: string;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const ConversationItem = ({
  conversation,
  currentUserId,
}: ConversationItemProps) => {
  const itemRef = useRef<View>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [itemLayout, setItemLayout] = useState({
    x: 0,
    y: screenHeight * 0.35,
    width: screenWidth,
    height: 80,
  });
  const [decryptedLastMessage, setDecryptedLastMessage] = useState("");

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const originalOpacity = useSharedValue(1);

  const conversationKey = useConversationKey(conversation._id);

  const otherParticipantRecord = conversation.allParticipants?.find(
    (p) => p.userId !== currentUserId,
  );
  const otherParticipantId = otherParticipantRecord?.userId;

  const otherParticipant = useQuery(
    api.functions.users.getUserById,
    otherParticipantId ? { userId: otherParticipantId } : "skip",
  );

  const messages = useQuery(api.functions.messages.getMessagesForConversation, {
    conversationId: conversation._id,
  });
  const lastMessage = messages?.[messages.length - 1];

  const deleteConversation = useMutation(
    api.functions.conversations.leaveConversation,
  );
  const pinConversation = useMutation(
    api.functions.conversations.pinConversation,
  );

  useEffect(() => {
    const run = async () => {
      if (!lastMessage) {
        setDecryptedLastMessage("");
        return;
      }
      if (lastMessage.type === "image") {
        setDecryptedLastMessage("📷 Sent an image");
        return;
      }
      if (lastMessage.type === "gif") {
        setDecryptedLastMessage("🎬 Sent a GIF");
        return;
      }
      if (!conversationKey || !lastMessage.content || !lastMessage.iv) {
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
      } catch {
        setDecryptedLastMessage("Unable to decrypt message");
      }
    };
    run();
  }, [lastMessage?._id, lastMessage?.iv, lastMessage?.type, conversationKey]);

  const animatedItemStyle = useAnimatedStyle(() => ({
    opacity: originalOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isPinned = !!conversation.userParticipant?.pinnedAt;

  // ─── Long press ─────────────────────────────────────────────────

  const handleLongPress = async () => {
    const layout = await new Promise<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>((resolve) => {
      if (itemRef.current) {
        itemRef.current.measureInWindow((x, y, width, height) => {
          resolve({ x, y, width, height });
        });
      } else {
        resolve({
          x: 0,
          y: screenHeight * 0.35,
          width: screenWidth,
          height: 80,
        });
      }
    });

    setItemLayout(layout);

    const targetY = screenHeight * 0.35;
    const moveUpDistance = targetY - layout.y;

    scale.value = withTiming(0.97, { duration: 150 });
    originalOpacity.value = withTiming(0.3, { duration: 150 });

    setTimeout(() => {
      scale.value = withTiming(1.02, { duration: 250 });
      translateY.value = withTiming(moveUpDistance, { duration: 300 });
      setShowModal(true);
    }, 150);
  };

  const handleCloseModal = () => {
    scale.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    originalOpacity.value = withTiming(1, { duration: 250 });
    setTimeout(() => setShowModal(false), 250);
  };

  // ─── Actions ────────────────────────────────────────────────────

  const handleOpen = () => {
    handleCloseModal();
    setTimeout(() => router.push(`/(chat)/${conversation._id}`), 300);
  };

  const handlePin = async () => {
    handleCloseModal();
    try {
      await pinConversation({ conversationId: conversation._id });
    } catch (error) {
      console.error("Failed to pin conversation:", error);
    }
  };

  const handleReport = () => {
    handleCloseModal();
    setTimeout(() => setShowReportModal(true), 350);
  };

  const handleDelete = () => {
    handleCloseModal();
    setTimeout(() => {
      Alert.alert(
        "Delete Conversation",
        `Are you sure you want to delete this conversation with ${otherParticipant?.username}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteConversation({ conversationId: conversation._id });
              } catch {
                Alert.alert("Error", "Failed to delete conversation.");
              }
            },
          },
        ],
      );
    }, 350);
  };

  const actions: ConversationContextAction[] = [
    {
      icon: "arrow-forward-circle-outline",
      label: "Open",
      action: handleOpen,
    },
    {
      icon: "pushpin",
      iconLib: "antdesign",
      label: isPinned ? "Unpin conversation" : "Pin conversation",
      action: handlePin,
    },
    {
      icon: "flag-outline",
      label: "Report",
      action: handleReport,
    },
    {
      icon: "trash-outline",
      label: "Delete",
      action: handleDelete,
      danger: true,
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────

  const renderItemContent = () => (
    <View className="flex-row items-center py-3 px-4">
      <View className="rounded-full items-center justify-center size-12 bg-primary-100 mr-3 overflow-hidden">
        {otherParticipant?.imageUrl ? (
          <Image
            source={otherParticipant.imageUrl}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text className="font-bold text-primary-700 text-xl">
            {otherParticipant?.username?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-bold text-xl text-main">
            {otherParticipant?.username}
          </Text>
          <View className="flex-row items-center gap-2">
            {isPinned && <AntDesign name="pushpin" size={12} color="#40916c" />}
            <Text className="text-base text-muted">
              {formatTime(conversation.lastMessageAt)}
            </Text>
          </View>
        </View>

        <Text
          className="text-base text-secondary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {decryptedLastMessage
            ? `${lastMessage?.senderId === currentUserId ? "You: " : ""}${decryptedLastMessage}`
            : "No messages yet"}
        </Text>
      </View>
    </View>
  );

  if (!otherParticipantId || !otherParticipant) return null;

  return (
    <>
      <View ref={itemRef}>
        <Pressable
          onPress={() => router.push(`/(chat)/${conversation._id}`)}
          onLongPress={handleLongPress}
          delayLongPress={300}
        >
          <Animated.View
            style={animatedItemStyle}
            className="bg-transparent px-2"
          >
            {renderItemContent()}
          </Animated.View>
        </Pressable>
      </View>

      <ConversationContextModal
        visible={showModal}
        itemLayout={itemLayout}
        scale={scale}
        translateY={translateY}
        onClose={handleCloseModal}
        actions={actions}
        renderItem={renderItemContent}
      />

      {otherParticipant && (
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={otherParticipant._id}
          reportedUsername={otherParticipant.username}
          conversationId={conversation._id}
        />
      )}
    </>
  );
};

export default ConversationItem;
