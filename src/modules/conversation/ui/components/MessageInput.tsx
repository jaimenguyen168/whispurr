import { View, TextInput, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/providers/ThemeProvider";
import { Message, User } from "@/src/types/convex";
import { decryptMessage } from "@/src/modules/conversation/utils/crypto";

interface MessageInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onAddAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
  replyingToMessage?: Message | null;
  onCancelReply?: () => void;
  currentUser?: User;
  otherUser?: User;
  clerkUserId: string;
  conversationKey?: string | null;
}

const MessageInput = ({
  message,
  onMessageChange,
  onSendMessage,
  onAddAttachment,
  placeholder = "Type a message",
  disabled = false,
  replyingToMessage,
  onCancelReply,
  currentUser,
  otherUser,
  clerkUserId,
  conversationKey,
}: MessageInputProps) => {
  const colors = useThemeColors();
  const [decryptedReplyContent, setDecryptedReplyContent] = useState("");

  useEffect(() => {
    const decryptReplyContent = async () => {
      if (replyingToMessage && conversationKey) {
        try {
          const decrypted = await decryptMessage(
            replyingToMessage.content,
            conversationKey,
            replyingToMessage.iv,
          );
          setDecryptedReplyContent(decrypted);
        } catch (error) {
          console.error("Failed to decrypt reply content:", error);
          setDecryptedReplyContent("Unable to decrypt message");
        }
      } else {
        setDecryptedReplyContent("");
      }
    };

    decryptReplyContent();
  }, [replyingToMessage, conversationKey]);

  const getReplyToUsername = () => {
    if (!replyingToMessage || !currentUser) return "";

    if (replyingToMessage.senderId === currentUser._id) {
      return "yourself";
    }

    return otherUser?.username || "Unknown user";
  };

  const updatedPlaceholder = replyingToMessage
    ? `Reply to ${getReplyToUsername()}...`
    : placeholder;

  return (
    <View className="bg-card pb-8 px-6 pt-4">
      {/* Reply Context Bar */}
      {replyingToMessage && (
        <View className="bg-secondary-100 dark:bg-secondary-800 rounded-2xl px-4 py-3 mb-3 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <Ionicons
                name="arrow-undo-outline"
                size={14}
                color={colors.accent}
                style={{ marginRight: 6 }}
              />
              <Text className="text-base font-medium text-accent">
                Replying to {getReplyToUsername()}
              </Text>
            </View>
            <Text
              className="text-base text-secondary-600 dark:text-secondary-400"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {decryptedReplyContent || "Loading..."}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onCancelReply}
            className="rounded-full p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input Row */}
      <View className="flex-row items-end gap-2 justify-between">
        <TouchableOpacity
          className="rounded-full items-center justify-center size-10"
          onPress={onAddAttachment}
          disabled={disabled}
        >
          <Ionicons name="add" size={32} color={colors.text} />
        </TouchableOpacity>

        <TextInput
          value={message}
          onChangeText={onMessageChange}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={updatedPlaceholder}
          className="flex-1 rounded-2xl bg-surface p-4 text-secondary"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={5}
          editable={!disabled}
        />

        <TouchableOpacity
          className="rounded-full items-center justify-center size-10"
          onPress={onSendMessage}
          disabled={disabled || !message.trim()}
        >
          <Ionicons
            name={
              disabled || !message.trim()
                ? "paper-plane-outline"
                : "paper-plane"
            }
            size={28}
            color={disabled || !message.trim() ? colors.muted : colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
