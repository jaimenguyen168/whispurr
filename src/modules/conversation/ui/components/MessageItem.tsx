import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { Message, User } from "@/src/types/convex";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { formatTime } from "@/src/utils/time";
import { decryptMessage } from "@/src/modules/conversation/utils";

interface MessageItemProps {
  message: Message;
  otherUser?: User;
}

const MessageItem = ({ message, otherUser }: MessageItemProps) => {
  const isFromOtherUser = message.senderId === otherUser?._id;

  const [decryptedContent, setDecryptedContent] = useState("");

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

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return (
          <Ionicons
            name="time-outline"
            size={12}
            color={ThemeColors.secondary.medium}
          />
        );
      case "sent":
        return (
          <Ionicons
            name="checkmark"
            size={12}
            color={ThemeColors.secondary.medium}
          />
        );
      case "delivered":
        return (
          <Ionicons
            name="checkmark-done"
            size={12}
            color={ThemeColors.secondary.medium}
          />
        );
      case "read":
        return (
          <Ionicons
            name="checkmark-done"
            size={12}
            color={ThemeColors.primary.main}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
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
      <View
        className={`rounded-2xl px-4 py-2.5 ${
          isFromOtherUser
            ? "bg-secondary-200 dark:bg-secondary-500 rounded-bl-sm"
            : "bg-accent rounded-br-sm"
        }`}
      >
        <Text
          className={`text-base leading-5 font-semibold ${
            isFromOtherUser
              ? "text-secondary-800 dark:text-secondary-50"
              : "text-white"
          }`}
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
            <View className="ml-1">{getStatusIcon(message.status)}</View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageItem;
