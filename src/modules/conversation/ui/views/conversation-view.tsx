import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React from "react";
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

interface ConversationViewProps {
  conversationId: ConversationId;
}

const HEADER_HEIGHT = 60;

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const [message, setMessage] = React.useState("");

  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const conversation = useQuery(
    api.functions.conversations.getConversationById,
    { conversationId },
  );

  const currentUser = useQuery(api.functions.users.getCurrentUser);

  const otherUser = useQuery(api.functions.users.getOtherUserByConversationId, {
    conversationId,
  });

  const messages = useQuery(api.functions.messages.getMessagesForConversation, {
    conversationId,
  });

  const createMessage = useMutation(api.functions.messages.createMessage);

  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      await createMessage({
        conversationId,
        senderId: currentUser._id,
        content: message.trim(),
        type: "text",
      });
      setMessage(""); // Clear the input after successful send
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!conversation || !otherUser || !currentUser) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: Message }) => {
    return <MessageItem message={item} otherUser={otherUser} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={ThemeColors.secondary.medium || "#9CA3AF"}
      />
      <Text className="text-gray-500 text-center text-lg font-medium mt-4 mb-2">
        Start the conversation
      </Text>
      <Text className="text-gray-400 text-center">
        Send the first message to {otherUser.username}
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <AnimatedHeader
        scrollThreshold={HEADER_HEIGHT}
        scrollOffset={scrollOffset}
        header1={<ConversationHeader1 user={otherUser} />}
        header2={<ConversationHeader2 user={otherUser} />}
      />

      <View className="flex-1">
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
      </View>

      <View className="bg-white pb-7 px-6 pt-3">
        <View className="flex-row items-end gap-2 justify-between">
          <TouchableOpacity className="rounded-full items-center justify-center size-10">
            <Ionicons name="add" size={32} color={ThemeColors.primary.main} />
          </TouchableOpacity>

          <TextInput
            value={message}
            onChangeText={setMessage}
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Type a message"
            className="flex-1 rounded-2xl bg-secondary-50 p-4"
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity
            className="rounded-full items-center justify-center size-10"
            onPress={sendMessage}
          >
            <Ionicons
              name="paper-plane-outline"
              size={28}
              color={ThemeColors.primary.main}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default ConversationView;
