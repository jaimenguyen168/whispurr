import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { encryptMessage } from "@/src/modules/conversation/utils/crypto";
import { useConversationKey } from "@/src/hooks/useConversationKey";
import { useThemeColors } from "@/src/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface ForwardMessageModalProps {
  visible: boolean;
  onClose: () => void;
  decryptedContent: string;
  clerkUserId: string;
}

const ForwardMessageModal = ({
  visible,
  onClose,
  decryptedContent,
  clerkUserId,
}: ForwardMessageModalProps) => {
  const colors = useThemeColors();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isSending, setIsSending] = useState(false);

  const currentUser = useQuery(api.functions.users.getCurrentUser);
  const conversations = useQuery(
    api.functions.conversations.getConversationsForUser,
  );
  const createMessage = useMutation(api.functions.messages.createMessage);
  const targetConversationKey = useConversationKey(
    selectedConversationId as any,
  );

  const handleSelect = (conversationId: string) => {
    setSelectedConversationId((prev) =>
      prev === conversationId ? null : conversationId,
    );
  };

  const handleSend = async () => {
    if (!selectedConversationId || !clerkUserId || isSending) return;
    if (!targetConversationKey) {
      console.warn("[ForwardModal] Conversation key not ready yet");
      return;
    }

    setIsSending(true);

    try {
      const { encryptedContent, iv } = await encryptMessage(
        decryptedContent,
        targetConversationKey,
      );

      await createMessage({
        conversationId: selectedConversationId as any,
        content: encryptedContent,
        iv,
        type: "text",
      });

      handleClose();

      // Navigate to the forwarded conversation
      router.push(`/(chat)/${selectedConversationId}`);
    } catch (error) {
      console.error("Failed to forward message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedConversationId(null);
    setIsSending(false);
    onClose();
  };

  const renderItem = ({ item }: { item: any }) => {
    const otherParticipantId = item.participantIds?.find(
      (id: string) => id !== currentUser?._id,
    );
    const isSelected = selectedConversationId === item._id;

    return (
      <OtherUserItem
        userId={otherParticipantId}
        conversationId={item._id}
        isSelected={isSelected}
        onPress={handleSelect}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={handleClose}
      />

      <View className="bg-card rounded-t-3xl" style={{ height: "50%" }}>
        {/* Handle */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-soft" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-4">
          <Text className="text-main font-bold text-xl">Forward to</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <FlatList
          data={conversations || []}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: selectedConversationId ? 100 : 32,
          }}
          columnWrapperStyle={{ justifyContent: "flex-start", gap: 8 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Send Button — slides up from bottom when someone is selected */}
        {selectedConversationId && (
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-card border-t border-soft">
            <TouchableOpacity
              onPress={handleSend}
              disabled={isSending}
              className="bg-accent rounded-2xl py-4 items-center justify-center flex-row gap-2"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="white" />
                  <Text className="text-white font-semibold text-lg">
                    Send
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const OtherUserItem = ({
  userId,
  conversationId,
  isSelected,
  onPress,
}: {
  userId: string;
  conversationId: string;
  isSelected: boolean;
  onPress: (conversationId: string) => void;
}) => {
  const user = useQuery(
    api.functions.users.getUserById,
    userId ? { userId: userId as any } : "skip",
  );

  if (!user) return null;

  return (
    <TouchableOpacity
      onPress={() => onPress(conversationId)}
      style={{ width: "31%", marginBottom: 16 }}
      className="items-center"
    >
      <View className="relative">
        <View
          className={`rounded-full size-16 bg-primary-100 overflow-hidden items-center justify-center ${
            isSelected ? "border-2 border-accent" : ""
          }`}
        >
          {user.imageUrl ? (
            <Image
              source={user.imageUrl}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text className="font-bold text-primary-700 text-3xl">
              {user.username?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {isSelected && (
          <View className="absolute bottom-0 right-0 bg-accent rounded-full size-5 items-center justify-center border-2 border-card">
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>

      <Text
        className={`text-sm font-medium mt-2 text-center ${
          isSelected ? "text-accent" : "text-main"
        }`}
        numberOfLines={1}
      >
        {user.username}
      </Text>
    </TouchableOpacity>
  );
};

export default ForwardMessageModal;
