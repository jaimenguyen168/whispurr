import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Message, MessageId, User } from "@/src/types/convex";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { formatTime } from "@/src/utils/time";
import { decryptMessage } from "@/src/modules/conversation/utils";
import { useThemeColors } from "@/src/providers/ThemeProvider";
import MessageReactionBadge from "@/src/modules/conversation/ui/components/MessageReactionBadge";
import { EmojiPopup } from "react-native-emoji-popup";

interface MessageItemProps {
  message: Message;
  currentUser?: User;
  otherUser?: User;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onUnsend?: (messageId: string) => void;
  onLongPress?: (message: Message) => void;
  onReact?: (messageId: MessageId, emoji: string) => void;
  onCopy?: (message: Message) => void;
}

const MessageItem = ({
  message,
  currentUser,
  otherUser,
  onReply,
  onForward,
  onDelete,
  onUnsend,
  onLongPress,
  onReact,
  onCopy,
}: MessageItemProps) => {
  const colors = useThemeColors();
  const isFromOtherUser = message.senderId === otherUser?._id;
  const messageContainerRef = useRef<View>(null);
  const hasReactions = message.reactions && message.reactions.length > 0;
  const [reactionEmojis, setReactionEmojis] = useState([
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "👍",
  ]);
  const [recentReaction, setRecentReaction] = useState<string | undefined>();
  const lastTap = useRef<number | null>(null);
  const DOUBLE_PRESS_DELAY = 300;

  const [decryptedContent, setDecryptedContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [messageLayout, setMessageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const originalMessageOpacity = useSharedValue(1);
  const blurOpacity = useSharedValue(0);
  const modalMessageOpacity = useSharedValue(0);
  const reactionsBarOpacity = useSharedValue(0);
  const contextMenuOpacity = useSharedValue(0);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const decryptContent = async () => {
      const decrypted = await decryptMessage(
        message.content,
        message.conversationId,
        message.encryptionKey || "",
      );
      setDecryptedContent(decrypted);
    };

    decryptContent();
  }, [message]);

  // Animation styles
  const originalMessageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: originalMessageOpacity.value,
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const modalMessageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalMessageOpacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const reactionsBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: reactionsBarOpacity.value,
    transform: [{ scale: reactionsBarOpacity.value }],
  }));

  const contextMenuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contextMenuOpacity.value,
    transform: [{ scale: contextMenuOpacity.value }],
  }));

  const measureMessagePosition = () => {
    return new Promise<{ x: number; y: number; width: number; height: number }>(
      (resolve) => {
        if (messageContainerRef.current) {
          messageContainerRef.current.measureInWindow((x, y, width, height) => {
            resolve({ x, y, width, height });
          });
        } else {
          // Fallback if measurement fails
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
    // Call the callback immediately
    onLongPress?.(message);

    // Get the exact message position
    const layout = await measureMessagePosition();
    setMessageLayout(layout);

    const targetY = screenHeight * 0.35; // Move to center-ish
    const moveUpDistance = targetY - layout.y;

    // Start the animation sequence
    // 1. First scale down slightly and fade original
    scale.value = withTiming(0.95, { duration: 150 });
    originalMessageOpacity.value = withTiming(0.3, { duration: 150 });

    // 2. Show modal after slight delay
    setTimeout(() => {
      setShowModal(true);

      // 3. Start all modal animations together but staggered
      blurOpacity.value = withTiming(1, { duration: 300 });

      // 4. Scale back up and move position for modal message
      scale.value = withTiming(1.05, { duration: 250 });
      translateY.value = withTiming(moveUpDistance, { duration: 300 });

      // 5. Fade in modal message
      modalMessageOpacity.value = withDelay(
        100,
        withTiming(1, { duration: 200 }),
      );

      // 6. Show reactions bar with bounce
      reactionsBarOpacity.value = withDelay(
        200,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.1, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );

      // 7. Show context menu slightly after
      contextMenuOpacity.value = withDelay(
        200,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );
    }, 150);
  };

  const handleCloseBlur = () => {
    // Animate everything out in reverse order
    contextMenuOpacity.value = withTiming(0, { duration: 200 });
    reactionsBarOpacity.value = withDelay(50, withTiming(0, { duration: 200 }));
    modalMessageOpacity.value = withDelay(
      100,
      withTiming(0, { duration: 200 }),
    );
    blurOpacity.value = withDelay(150, withTiming(0, { duration: 250 }));

    // Reset message position and scale
    scale.value = withDelay(200, withTiming(1, { duration: 250 }));
    translateY.value = withDelay(200, withTiming(0, { duration: 250 }));
    originalMessageOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 250 }),
    );

    // Hide modal after all animations complete
    setTimeout(() => setShowModal(false), 450);
  };

  useEffect(() => {
    if (!currentUser || !message.reactions) return;

    // Get the current user's reactions for this message
    const userReactions = message.reactions.filter(
      (reaction) => reaction.userId === currentUser._id,
    );

    userReactions.forEach((reaction) => {
      // If the user's reaction emoji is not in the current list, replace the last one
      if (!reactionEmojis.includes(reaction.emoji)) {
        setReactionEmojis((prev) => {
          const newEmojis = [...prev];
          newEmojis[newEmojis.length - 1] = reaction.emoji;
          return newEmojis;
        });
      }
    });
  }, [message.reactions, currentUser, reactionEmojis]);

  const handleReaction = (emoji: string) => {
    onReact?.(message._id, emoji);
    setRecentReaction(emoji);
    handleCloseBlur();

    setTimeout(() => setRecentReaction(undefined), 1000);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      onReact?.(message._id, "❤️");
      setRecentReaction("❤️");
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }

    setTimeout(() => setRecentReaction(undefined), 1000);
  };

  const handleContextAction = (action: () => void) => {
    action();
    handleCloseBlur();
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

  const renderMessageContent = () => (
    <View
      className={`rounded-3xl px-4 pt-4 pb-2 relative ${hasReactions ? "mt-3" : ""} ${
        isFromOtherUser
          ? "bg-secondary-200 dark:bg-secondary-500 rounded-bl-none"
          : "bg-accent rounded-br-none"
      }`}
    >
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
        className={`absolute -top-5 ${
          isFromOtherUser ? "-right-4" : "-left-4"
        }`}
        animateIcon={recentReaction}
      />
    </View>
  );

  const renderReactionsBar = () => {
    const hasUserReactedWith = (emoji: string): boolean => {
      if (!currentUser || !message.reactions) return false;

      return message.reactions.some(
        (reaction) =>
          reaction.emoji === emoji && reaction.userId === currentUser._id,
      );
    };

    return (
      <Animated.View style={[reactionsBarAnimatedStyle]}>
        <View className="bg-white dark:bg-gray-800/90 rounded-full px-6 py-3 shadow-lg">
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            Tap or pick an emoji to react
          </Text>
          <View className="flex-row items-center justify-between">
            {reactionEmojis.map((emoji, index) => {
              const hasReacted = hasUserReactedWith(emoji);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleReaction(emoji)}
                  className="w-10 h-10 items-center justify-center relative"
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  {/* Dot indicator for current user's reaction */}
                  {hasReacted && (
                    <View
                      className="absolute bottom-0 w-1.5 h-1.5 bg-blue-500 rounded-full"
                      style={{ bottom: -2 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            <EmojiPopup
              onEmojiSelected={(selectedEmoji) => {
                handleReaction(selectedEmoji);
              }}
            >
              <TouchableOpacity className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </EmojiPopup>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderContextMenu = () => {
    const contextOptions = [
      {
        icon: "arrow-undo-outline",
        label: "Reply",
        action: () => onReply?.(message),
      },
      {
        icon: "paper-plane-outline",
        label: "Forward",
        action: () => onForward?.(message),
      },
      {
        icon: "copy-outline",
        label: "Copy",
        action: () => onCopy?.(message),
      },
      {
        icon: "trash-outline",
        label: "Delete for you",
        action: () => onDelete?.(message._id),
      },
      ...(isFromOtherUser
        ? []
        : [
            {
              icon: "return-up-back-outline",
              label: "Unsend",
              action: () => onUnsend?.(message._id),
              danger: true,
            },
          ]),
    ];

    return (
      <Animated.View
        style={[
          contextMenuAnimatedStyle,
          { alignItems: isFromOtherUser ? "flex-start" : "flex-end" },
        ]}
        pointerEvents="box-none"
      >
        <View className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg overflow-hidden py-2">
          {contextOptions.map((option, index) => (
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
      </Animated.View>
    );
  };

  return (
    <>
      <View
        ref={messageContainerRef}
        className={`px-4 ${isFromOtherUser ? "items-start mr-24 flex-row gap-2" : "items-end ml-24"}`}
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

      {/* Modal with Blur Overlay and Interactive Elements */}
      <Modal
        transparent
        visible={showModal}
        animationType="none"
        onRequestClose={handleCloseBlur}
        statusBarTranslucent
      >
        {/* Blur Background */}
        <Animated.View style={[{ flex: 1 }, blurAnimatedStyle]}>
          <BlurView intensity={50} tint="dark" style={{ flex: 1 }} />
        </Animated.View>

        {/* Animated Message on top of blur */}
        <Animated.View
          style={[
            modalMessageAnimatedStyle,
            {
              position: "absolute",
              left: messageLayout.x,
              top: messageLayout.y,
              width: messageLayout.width,
              zIndex: 10,
              paddingHorizontal: 20,
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Reactions Bar */}
          {renderReactionsBar()}

          {/* Message */}
          <View
            className={`my-3 ${isFromOtherUser ? "flex-row gap-2 items-end" : "items-end"}`}
          >
            {renderMessageContent()}
          </View>

          {/* Context Menu */}
          {renderContextMenu()}
        </Animated.View>

        {/* Invisible pressable to close modal */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={handleCloseBlur}
        />
      </Modal>
    </>
  );
};

export default MessageItem;
