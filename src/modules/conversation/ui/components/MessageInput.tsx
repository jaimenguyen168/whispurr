import { View, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";

interface MessageInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onAddAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const MessageInput = ({
  message,
  onMessageChange,
  onSendMessage,
  onAddAttachment,
  placeholder = "Type a message",
  disabled = false,
}: MessageInputProps) => {
  return (
    <View className="bg-white pb-8 px-6 pt-4">
      <View className="flex-row items-end gap-2 justify-between">
        <TouchableOpacity
          className="rounded-full items-center justify-center size-10"
          onPress={onAddAttachment}
          disabled={disabled}
        >
          <Ionicons name="add" size={32} color={ThemeColors.primary.main} />
        </TouchableOpacity>

        <TextInput
          value={message}
          onChangeText={onMessageChange}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={placeholder}
          className="flex-1 rounded-2xl bg-secondary-50 p-4"
          placeholderTextColor={ThemeColors.secondary.base}
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
            name="paper-plane-outline"
            size={28}
            color={
              disabled || !message.trim() ? "#9CA3AF" : ThemeColors.primary.main
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
