import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConversationId, Message } from "@/src/types/convex";
import * as ImagePicker from "expo-image-picker";
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
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";
import MessageItem from "@/src/modules/conversation/ui/components/MessageItem";
import { router } from "expo-router";
import MessageInput from "@/src/modules/conversation/ui/components/MessageInput";
import { encryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useAuth } from "@clerk/expo";
import { useConversationKey } from "@/src/hooks/useConversationKey";
import ForwardMessageModal from "@/src/modules/conversation/ui/components/ForwardMessageModal";
import ReportModal from "@/src/modules/conversation/ui/components/ReportModal";
import { useStreamVideo } from "@/src/hooks/useStreamVideo";
import {
  GiphyDialog,
  GiphyDialogEvent,
  GiphyContentType,
} from "@giphy/react-native-sdk";

interface ConversationViewProps {
  conversationId: ConversationId;
}

const HEADER_HEIGHT = 60;

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const { userId: clerkUserId } = useAuth();
  const { startCall, isReady } = useStreamVideo();
  const conversationKey = useConversationKey(conversationId);
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
    null,
  );
  const [forwardContent, setForwardContent] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);
  const flatListRef = useRef<any>(null);

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
  const pinConversation = useMutation(
    api.functions.conversations.pinConversation,
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

  const reportStatus = useQuery(
    api.functions.moderation.getReportStatus,
    otherUser ? { reportedUserId: otherUser._id } : "skip",
  );

  const createMessage = useMutation(api.functions.messages.createMessage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const sendMessage = async () => {
    if (!message.trim() || !currentUser || isSending || !clerkUserId) return;
    if (!conversationKey) {
      console.warn("[ConversationView] Conversation key not ready yet");
      return;
    }

    setIsSending(true);

    try {
      const { encryptedContent, iv } = await encryptMessage(
        message.trim(),
        conversationKey,
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

  const uploadAndSendImage = async (uri: string, mimeType?: string) => {
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uri);
    const blob = await response.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": mimeType ?? "image/jpeg" },
      body: blob,
    });
    if (!uploadResponse.ok) throw new Error("Upload failed");
    const { storageId } = await uploadResponse.json();
    await createMessage({
      conversationId,
      content: "",
      iv: "",
      type: "image",
      storageId,
    });
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow access to your photo library to send images.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      await uploadAndSendImage(asset.uri, asset.mimeType ?? undefined);
    } catch (error) {
      console.error("Failed to send image:", error);
      Alert.alert("Error", "Failed to send image. Please try again.");
    }
  };

  const handlePickGif = () => {
    GiphyDialog.configure({ mediaTypeConfig: [GiphyContentType.Gif] });
    const subscription = GiphyDialog.addListener(
      GiphyDialogEvent.MediaSelected,
      async (e) => {
        subscription.remove();
        GiphyDialog.hide();
        const gifUrl = e.media.data.images?.original?.url ?? e.media.url;
        try {
          await createMessage({
            conversationId,
            content: "",
            iv: "",
            type: "gif",
            gifUrl,
          });
        } catch (error) {
          console.error("Failed to send GIF:", error);
          Alert.alert("Error", "Failed to send GIF. Please try again.");
        }
      },
    );
    GiphyDialog.addListener(GiphyDialogEvent.Dismissed, () => {
      subscription.remove();
    });
    GiphyDialog.show();
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow access to your camera to take photos.",
      );
      return;
    }
    let result;
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });
    } catch (error: any) {
      if (error?.message?.includes("not available on simulator")) {
        Alert.alert(
          "Not available",
          "Camera is not available on the simulator.",
        );
      } else {
        Alert.alert("Error", "Could not open camera. Please try again.");
      }
      return;
    }
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      await uploadAndSendImage(asset.uri, asset.mimeType ?? undefined);
    } catch (error) {
      console.error("Failed to send camera photo:", error);
      Alert.alert("Error", "Failed to send photo. Please try again.");
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

  const scrollToBottom = (animated = true) => {
    flatListRef.current?.scrollToOffset({ offset: 999999, animated });
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
      conversationKey={conversationKey}
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
      <Text className="text-main text-center text-xl font-medium mt-4 mb-2">
        Start the conversation
      </Text>
      <Text className="text-secondary text-center">
        Send the first message to {otherUser.username}
      </Text>
    </View>
  );

  const handleVoiceCall = () => {
    console.log(
      "[ConversationView] Voice call tapped — isReady:",
      isReady,
      "otherUser:",
      otherUser?._id,
    );
    if (!otherUser) return;
    startCall({
      callId: `voice_${conversationId}`,
      callType: "audio_room",
      receiverConvexUserId: otherUser._id,
    }).catch((err) => {
      console.error("[ConversationView] Voice call failed:", err);
      Alert.alert("Call failed", err?.message || "Could not start call.");
    });
  };

  const handleVideoCall = () => {
    console.log(
      "[ConversationView] Video call tapped — isReady:",
      isReady,
      "otherUser:",
      otherUser?._id,
    );
    if (!otherUser) return;
    startCall({
      callId: `video_${conversationId}`,
      callType: "default",
      receiverConvexUserId: otherUser._id,
    }).catch((err) => {
      console.error("[ConversationView] Video call failed:", err);
      Alert.alert("Call failed", err?.message || "Could not start call.");
    });
  };

  const isPinned = !!conversation?.userParticipant?.pinnedAt;

  const handlePin = async () => {
    try {
      await pinConversation({ conversationId });
    } catch (error) {
      console.error("Failed to pin conversation:", error);
    }
  };

  const headerActions = {
    onPin: handlePin,
    isPinned,
    hasReported: reportStatus?.hasReported ?? false,
    onReport: () => setShowReportModal(true),
    onDelete: handleDeleteConversation,
    onCall: handleVoiceCall,
    onVideoCall: handleVideoCall,
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
          {isPinned && (
            <View
              className="flex-row items-center justify-center gap-1.5 py-1.5 bg-primary-100 dark:bg-primary-400/30"
              style={{ marginTop: HEADER_HEIGHT + insets.top }}
            >
              <AntDesign name="pushpin" size={12} color="#40916c" />
              <Text className="text-sm font-medium text-primary-600 dark:text-primary-300">
                Pinned conversation
              </Text>
            </View>
          )}
          <Animated.FlatList
            ref={flatListRef}
            data={messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: isPinned ? 16 : HEADER_HEIGHT + insets.top + 16,
              gap: 12,
              justifyContent: "flex-end",
              paddingBottom: 24,
            }}
            ListEmptyComponent={renderEmptyState}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollToBottom(false)}
            onLayout={() => scrollToBottom(false)}
          />

          {hasOtherUserLeft && (
            <View className="bg-surface px-4 py-3 border-t border-soft">
              <Text className="text-secondary text-center text-base">
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
          onPickImage={handlePickImage}
          onOpenCamera={handleOpenCamera}
          onPickGif={handlePickGif}
          disabled={isDeleting || isSending || hasOtherUserLeft}
          replyingToMessage={replyingToMessage}
          onCancelReply={() => setReplyingToMessage(null)}
          currentUser={currentUser}
          otherUser={otherUser}
          clerkUserId={clerkUserId}
          conversationKey={conversationKey}
        />
      </KeyboardAvoidingView>

      <ForwardMessageModal
        visible={!!forwardContent}
        onClose={() => setForwardContent(null)}
        decryptedContent={forwardContent || ""}
        clerkUserId={clerkUserId}
      />

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={otherUser._id}
        reportedUsername={otherUser.username}
        conversationId={conversationId}
      />
    </View>
  );
};

export default ConversationView;
