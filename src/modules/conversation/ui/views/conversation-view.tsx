import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationId, Message } from "@/src/types/convex";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import AnimatedHeader from "@/src/components/AnimatedHeader";
import {
  ConversationHeader1,
  ConversationHeader2,
} from "@/src/modules/conversation/ui/components/ConversationHeaders";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";
import MessageItem from "@/src/modules/conversation/ui/components/MessageItem";
import { router } from "expo-router";
import MessageInput from "@/src/modules/conversation/ui/components/MessageInput";
import { encryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useAuth } from "@clerk/clerk-expo";
import ForwardMessageModal from "@/src/modules/conversation/ui/components/ForwardMessageModal";

interface ConversationViewProps {
  conversationId: ConversationId;
}

const HEADER_HEIGHT = 60;

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const { userId: clerkUserId } = useAuth();
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
    null,
  );
  const [forwardContent, setForwardContent] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const conversation = useQuery(
    api.functions.conversations.getConversationById,
    isDeleting ? "skip" : { conversationId },
  );

  const deleteConversation = useMutation(
    api.functions.conversations.leaveConversation,
  );

  const currentUser = useQuery(api.functions.users.getCurrentUser);

  const otherUser = useQuery(
    api.functions.users.getOtherUserByConversationId,
    isDeleting ? "skip" : { conversationId },
  );

  const otherUserParticipant = conversation?.allParticipants?.find(
    (participant) => participant.userId !== currentUser?._id,
  );
  const hasOtherUserLeft = otherUserParticipant?.leftAt !== undefined;

  const messages = useQuery(
    api.functions.messages.getMessagesForConversation,
    isDeleting ? "skip" : { conversationId },
  );

  const createMessage = useMutation(api.functions.messages.createMessage);

  const sendMessage = async () => {
    if (!message.trim() || !currentUser || isSending || !clerkUserId) return;

    setIsSending(true);

    try {
      const { encryptedContent, iv } = await encryptMessage(
        message.trim(),
        conversationId,
        clerkUserId,
      );

      await createMessage({
        conversationId,
        content: encryptedContent,
        iv,
        type: "text",
        ...(replyingToMessage && { replyToMessageId: replyingToMessage._id }),
      });

      setMessage("");
      setReplyingToMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const executeDeleteConversation = async () => {
    try {
      setIsDeleting(true);
      await deleteConversation({ conversationId });
      router.dismiss();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setIsDeleting(false);
      Alert.alert("Error", "Failed to delete conversation. Please try again.");
    }
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete this conversation with ${otherUser?.username}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: executeDeleteConversation,
        },
      ],
    );
  };

  const handleReply = (message: Message) => {
    setReplyingToMessage(message);
  };

  const handleBack = async () => {
    if (messages?.length === 0) {
      await executeDeleteConversation();
    } else {
      router.dismiss();
    }
  };

  if (isDeleting) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={ThemeColors.primary.main} />
      </View>
    );
  }

  if (!conversation || !otherUser || !currentUser || !clerkUserId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-main">Loading...</Text>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      message={item}
      currentUser={currentUser}
      otherUser={otherUser}
      conversationId={conversationId}
      clerkUserId={clerkUserId}
      onReply={handleReply}
      onForward={(content) => setForwardContent(content)}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={ThemeColors.secondary.medium || "#9CA3AF"}
      />
      <Text className="text-main text-center text-lg font-medium mt-4 mb-2">
        Start the conversation
      </Text>
      <Text className="text-secondary text-center">
        Send the first message to {otherUser.username}
      </Text>
    </View>
  );

  const headerActions = {
    onPin: () => console.log("Pin conversation"),
    onReport: () => console.log("Report user"),
    onDelete: handleDeleteConversation,
    onCall: () => console.log("Start voice call"),
    onVideoCall: () => console.log("Start video call"),
  };

  return (
    <View className="flex-1">
      <AnimatedHeader
        scrollThreshold={HEADER_HEIGHT}
        scrollOffset={scrollOffset}
        header1={
          <ConversationHeader1
            user={otherUser}
            onBack={handleBack}
            actions={headerActions}
          />
        }
        header2={
          <ConversationHeader2
            user={otherUser}
            onBack={handleBack}
            actions={headerActions}
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="flex-1 bg-app">
          <Animated.FlatList
            data={messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: HEADER_HEIGHT + insets.top + 16,
              gap: 12,
              justifyContent: "flex-end",
              paddingBottom: 16,
            }}
            ListEmptyComponent={renderEmptyState}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          />

          {hasOtherUserLeft && (
            <View className="bg-surface px-4 py-3 border-t border-soft">
              <Text className="text-secondary text-center text-sm">
                {otherUser.username} has left this conversation. You can no
                longer send messages.
              </Text>
            </View>
          )}
        </View>

        <MessageInput
          message={message}
          onMessageChange={setMessage}
          onSendMessage={sendMessage}
          onAddAttachment={() => console.log("Add attachment")}
          disabled={isDeleting || isSending || hasOtherUserLeft}
          replyingToMessage={replyingToMessage}
          onCancelReply={() => setReplyingToMessage(null)}
          currentUser={currentUser}
          otherUser={otherUser}
          clerkUserId={clerkUserId}
        />
      </KeyboardAvoidingView>

      <ForwardMessageModal
        visible={!!forwardContent}
        onClose={() => setForwardContent(null)}
        decryptedContent={forwardContent || ""}
        clerkUserId={clerkUserId}
      />
    </View>
  );
};

export default ConversationView;
