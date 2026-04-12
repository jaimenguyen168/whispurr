import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Message, MessageId, MessageWithReply, User } from "@/src/types/convex";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { formatTime } from "@/src/utils/time";
import { decryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useThemeColors } from "@/src/providers/ThemeProvider";
import { EmojiPopup } from "react-native-emoji-popup";
import MessageReactionBadge from "@/src/modules/conversation/ui/components/MessageReactionBadge";
import MessageModal from "@/src/modules/conversation/ui/components/MessageModal";
import { useKeyReady } from "@/src/providers/KeySetupProvider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Clipboard from "expo-clipboard";

interface ContextMenuOption {
  icon: string;
  label: string;
  action: () => void;
  danger?: boolean;
}

interface MessageItemProps {
  message: MessageWithReply;
  currentUser?: User;
  otherUser?: User;
  conversationId: string;
  clerkUserId: string;
  onReply?: (message: Message) => void;
  onForward?: (decryptedContent: string) => void;
}

const MessageItem = ({
  message,
  currentUser,
  otherUser,
  conversationId,
  clerkUserId,
  onReply,
  onForward,
}: MessageItemProps) => {
  const colors = useThemeColors();
  const { isKeyReady } = useKeyReady();
  const isFromOtherUser = message.senderId === otherUser?._id;
  const messageContainerRef = useRef<View>(null);
  const hasReactions = message.reactions && message.reactions.length > 0;
  const [recentReaction, setRecentReaction] = useState<string | undefined>();
  const [reactionEmojis, setReactionEmojis] = useState([
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "👍",
  ]);
  const lastTap = useRef<number | null>(null);
  const DOUBLE_PRESS_DELAY = 300;

  const [decryptedContent, setDecryptedContent] = useState("");
  const [decryptedReplyContent, setDecryptedReplyContent] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [messageLayout, setMessageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const originalMessageOpacity = useSharedValue(1);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  // ─── Convex mutations ────────────────────────────────────────────
  const toggleReaction = useMutation(
    api.functions.messages.toggleMessageReaction,
  );
  const deleteMessageMutation = useMutation(
    api.functions.messages.deleteMessage,
  );
  const unsendMessageMutation = useMutation(
    api.functions.messages.unsendMessage,
  );

  // ─── Decryption ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isKeyReady || !clerkUserId) return;

    const decryptContent = async () => {
      try {
        const decrypted = await decryptMessage(
          message.content,
          conversationId,
          message.iv,
          clerkUserId,
        );
        setDecryptedContent(decrypted);
      } catch (error) {
        console.error("[MessageItem] Failed to decrypt message:", error);
        setDecryptedContent("Failed to decrypt message");
      }
    };

    decryptContent();
  }, [message.content, message.iv, conversationId, isKeyReady, clerkUserId]);

  useEffect(() => {
    if (!isKeyReady || !clerkUserId || !message.replyTo) return;

    const decryptReplyContent = async () => {
      try {
        const decrypted = await decryptMessage(
          message.replyTo!.content,
          conversationId,
          message.replyTo!.iv,
          clerkUserId,
        );
        setDecryptedReplyContent(decrypted);
      } catch (error) {
        console.error("[MessageItem] Failed to decrypt reply:", error);
        setDecryptedReplyContent("Failed to decrypt reply");
      }
    };

    decryptReplyContent();
  }, [message.replyTo, conversationId, clerkUserId, isKeyReady]);

  // ─── Reaction emojis ─────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser || !message.reactions) return;

    const userReactions = message.reactions.filter(
      (reaction) => reaction.userId === currentUser._id,
    );

    userReactions.forEach((reaction) => {
      if (!reactionEmojis.includes(reaction.emoji)) {
        setReactionEmojis((prev) => {
          const newEmojis = [...prev];
          newEmojis[newEmojis.length - 1] = reaction.emoji;
          return newEmojis;
        });
      }
    });
  }, [message.reactions, currentUser, reactionEmojis]);

  // ─── Actions ─────────────────────────────────────────────────────

  const handleReact = async (emoji: string) => {
    try {
      await toggleReaction({ messageId: message._id, emoji });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessageMutation({ messageId: message._id });
    } catch (error) {
      Alert.alert("Error", "Failed to delete message.");
    }
  };

  const handleUnsend = () => {
    Alert.alert(
      "Unsend Message",
      "This will remove the message for everyone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsend",
          style: "destructive",
          onPress: async () => {
            try {
              await unsendMessageMutation({ messageId: message._id });
            } catch (error) {
              Alert.alert("Error", "Failed to unsend message.");
            }
          },
        },
      ],
    );
  };

  const handleCopy = async () => {
    if (decryptedContent) {
      await Clipboard.setStringAsync(decryptedContent);
    }
  };

  // ─── Animation ───────────────────────────────────────────────────

  const originalMessageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: originalMessageOpacity.value,
  }));

  const measureMessagePosition = () => {
    return new Promise<{ x: number; y: number; width: number; height: number }>(
      (resolve) => {
        if (messageContainerRef.current) {
          messageContainerRef.current.measureInWindow((x, y, width, height) => {
            resolve({ x, y, width, height });
          });
        } else {
          resolve({
            x: isFromOtherUser ? 32 : screenWidth - 200,
            y: screenHeight * 0.6,
            width: 200,
            height: 60,
          });
        }
      },
    );
  };

  const handleLongPress = async () => {
    const layout = await measureMessagePosition();
    setMessageLayout(layout);

    const targetY = screenHeight * 0.35;
    const moveUpDistance = targetY - layout.y;

    scale.value = withTiming(0.95, { duration: 150 });
    originalMessageOpacity.value = withTiming(0.3, { duration: 150 });

    setTimeout(() => {
      scale.value = withTiming(1.05, { duration: 250 });
      translateY.value = withTiming(moveUpDistance, { duration: 300 });
      setShowModal(true);
    }, 150);
  };

  const handleCloseModal = () => {
    scale.value = withTiming(1, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    originalMessageOpacity.value = withTiming(1, { duration: 250 });
    setTimeout(() => setShowModal(false), 250);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      handleReact("❤️");
      setRecentReaction("❤️");
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
    setTimeout(() => setRecentReaction(undefined), 1000);
  };

  const handleReaction = (emoji: string) => {
    handleReact(emoji);
    setRecentReaction(emoji);
    handleCloseModal();
    setTimeout(() => setRecentReaction(undefined), 1000);
  };

  const handleForward = () => {
    handleCloseModal(); // close MessageModal first
    setTimeout(() => {
      onForward?.(decryptedContent);
    }, 300);
  };

  const handleContextAction = (action: () => void) => {
    action();
    handleCloseModal();
  };

  const hasUserReactedWith = (emoji: string): boolean => {
    if (!currentUser || !message.reactions) return false;
    return message.reactions.some(
      (r) => r.emoji === emoji && r.userId === currentUser._id,
    );
  };

  const getContextOptions = (): ContextMenuOption[] => {
    const options: ContextMenuOption[] = [
      {
        icon: "arrow-undo-outline",
        label: "Reply",
        action: () => onReply?.(message),
      },
      {
        icon: "paper-plane-outline",
        label: "Forward",
        action: handleForward,
      },
      { icon: "copy-outline", label: "Copy", action: handleCopy },
      { icon: "trash-outline", label: "Delete for you", action: handleDelete },
    ];

    if (!isFromOtherUser) {
      options.push({
        icon: "return-up-back-outline",
        label: "Unsend",
        action: handleUnsend,
        danger: true,
      });
    }

    return options;
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Ionicons name="time-outline" size={12} color={colors.text} />;
      case "sent":
        return <Ionicons name="checkmark" size={12} color={colors.text} />;
      case "delivered":
        return <Ionicons name="checkmark-done" size={12} color={colors.text} />;
      case "read":
        return <Ionicons name="checkmark-done" size={12} color={colors.text} />;
      default:
        return null;
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  const renderMessageContent = () => (
    <View
      className={`rounded-3xl px-4 pt-4 pb-2 relative ${hasReactions ? "mt-3" : ""} ${
        isFromOtherUser
          ? "bg-secondary-200 dark:bg-secondary-500 rounded-bl-none"
          : "bg-accent rounded-br-none"
      }`}
    >
      {message.replyTo && decryptedReplyContent && (
        <View
          className={`mb-3 p-2 rounded-lg border-l-2 ${
            isFromOtherUser
              ? "bg-secondary-100/50 dark:bg-secondary-600/30 border-secondary-300 dark:border-secondary-400"
              : "bg-white/10 border-white/30"
          }`}
        >
          <Text
            className={`text-xs font-medium mb-1 ${
              isFromOtherUser
                ? "text-secondary-500 dark:text-secondary-300"
                : "text-white/70"
            }`}
          >
            Replying to{" "}
            {message.replyTo.senderId === currentUser?._id
              ? "yourself"
              : otherUser?.username}
          </Text>
          <Text
            className={`text-sm ${
              isFromOtherUser
                ? "text-secondary-600 dark:text-secondary-200"
                : "text-white/80"
            }`}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {decryptedReplyContent}
          </Text>
        </View>
      )}

      <Text
        className={`text-lg leading-5 font-medium ${
          isFromOtherUser
            ? "text-secondary-800 dark:text-secondary-50"
            : "text-white"
        }`}
        style={{ flexShrink: 1 }}
      >
        {decryptedContent}
      </Text>

      <View
        className={`flex-row items-center ${
          isFromOtherUser ? "justify-start" : "justify-end"
        }`}
      >
        <Text
          className={`text-xs font-light ${
            isFromOtherUser ? "text-secondary-200" : "text-secondary-50"
          }`}
        >
          {formatTime(message._creationTime, "time")}
        </Text>

        {!isFromOtherUser && (
          <View className="ml-1 dark:text-secondary-50">
            {getStatusIcon(message.status)}
          </View>
        )}
      </View>

      <MessageReactionBadge
        reactions={message.reactions}
        className={`absolute -top-5 ${isFromOtherUser ? "-right-4" : "-left-4"}`}
        animateIcon={recentReaction}
      />
    </View>
  );

  const renderReactionsBar = () => (
    <View className="bg-white dark:bg-gray-800/90 rounded-full px-6 py-3 shadow-lg">
      <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        Tap or pick an emoji to react
      </Text>
      <View className="flex-row items-center justify-between">
        {reactionEmojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleReaction(emoji)}
            className="w-10 h-10 items-center justify-center relative"
          >
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
            {hasUserReactedWith(emoji) && (
              <View
                className="absolute bottom-0 w-1.5 h-1.5 bg-blue-500 rounded-full"
                style={{ bottom: -2 }}
              />
            )}
          </TouchableOpacity>
        ))}
        <EmojiPopup onEmojiSelected={handleReaction}>
          <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </EmojiPopup>
      </View>
    </View>
  );

  const renderContextMenu = () => (
    <View className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden py-2">
      {getContextOptions().map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleContextAction(option.action)}
          className="flex-row items-center px-8 py-4"
        >
          <Ionicons
            name={option.icon as any}
            size={20}
            color={option.danger ? "#ef4444" : colors.text}
            style={{ marginRight: 12 }}
          />
          <Text
            className={`text-base ${
              option.danger
                ? "text-red-500"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <View
        ref={messageContainerRef}
        className={`px-4 ${
          isFromOtherUser
            ? "items-start mr-24 flex-row gap-2"
            : "items-end ml-24"
        }`}
      >
        {isFromOtherUser && (
          <Link href={"/profile"} asChild>
            <TouchableOpacity className="rounded-full items-center justify-center size-8 bg-accent overflow-hidden mt-auto mb-1">
              {otherUser?.imageUrl ? (
                <Image
                  source={otherUser.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="font-bold text-primary-700 text-lg">
                  {otherUser?.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </Link>
        )}

        <Pressable
          onPress={handleDoubleTap}
          onLongPress={handleLongPress}
          delayLongPress={300}
        >
          <Animated.View style={originalMessageAnimatedStyle}>
            {renderMessageContent()}
          </Animated.View>
        </Pressable>
      </View>

      <MessageModal
        visible={showModal}
        message={message}
        currentUser={currentUser}
        messageLayout={messageLayout}
        isFromOtherUser={isFromOtherUser}
        recentReaction={recentReaction}
        scale={scale}
        translateY={translateY}
        onClose={handleCloseModal}
        onReact={(messageId: MessageId, emoji: string) => handleReact(emoji)}
        renderMessageContent={renderMessageContent}
        renderReactionsBar={renderReactionsBar}
        renderContextMenu={renderContextMenu}
      />
    </>
  );
};

export default MessageItem;
