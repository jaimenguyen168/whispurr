import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContextMenu from "react-native-context-menu-view";
import { Message, User } from "@/src/types/convex";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { formatTime } from "@/src/utils/time";
import { decryptMessage } from "@/src/modules/conversation/utils";
import { useThemeColors } from "@/src/providers/ThemeProvider";

interface MessageItemProps {
  message: Message;
  otherUser?: User;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onUnsend?: (messageId: string) => void;
}

const MessageItem = ({
  message,
  otherUser,
  onReply,
  onForward,
  onDelete,
  onUnsend,
}: MessageItemProps) => {
  const colors = useThemeColors();
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

  const getMenuActions = () => {
    const baseActions = [
      {
        title: "Reply",
        systemIcon: "arrowshape.turn.up.left",
        titleColor: colors.text,
      },
      {
        title: "Add sticker",
        systemIcon: "face.smiling",
        titleColor: colors.text,
      },
      {
        title: "Forward",
        systemIcon: "arrowshape.turn.up.right",
        titleColor: colors.text,
      },
      {
        title: "Delete for you",
        systemIcon: "trash",
        destructive: true,
      },
    ];

    if (!isFromOtherUser) {
      baseActions.push({
        title: "Unsend",
        systemIcon: "arrow.uturn.backward",
        destructive: true,
      });
    }

    return baseActions;
  };

  const handleMenuPress = (event: any) => {
    const { name } = event.nativeEvent;

    switch (name) {
      case "Reply":
        onReply?.(message);
        break;
      case "Add sticker":
        // Handle add sticker
        console.log("Add sticker");
        break;
      case "Forward":
        onForward?.(message);
        break;
      case "Delete for you":
        onDelete?.(message._id);
        break;
      case "Unsend":
        onUnsend?.(message._id);
        break;
    }
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

      <ContextMenu
        actions={getMenuActions()}
        onPress={handleMenuPress}
        previewBackgroundColor="transparent"
        dropdownMenuMode={true}
      >
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
        </View>
      </ContextMenu>
    </View>
  );
};

export default MessageItem;
