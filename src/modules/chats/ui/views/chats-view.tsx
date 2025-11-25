import { View, Text } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ConversationsLoading from "@/src/modules/chats/ui/components/ConversationsLoading";
import ConversationsEmpty from "@/src/modules/chats/ui/components/ConversationsEmpty";
import AnimatedHeader from "@/src/components/AnimatedHeader";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChatsHeader1,
  ChatsHeader2,
} from "@/src/modules/chats/ui/components/ChatsHeader";

const HEADER_HEIGHT = 60;

const ChatsView = () => {
  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const conversations = useQuery(
    api.functions.conversations.getConversationsForUser,
  );

  const fakeData = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    number: index + 1,
  }));

  if (!conversations) {
    return <ConversationsLoading />;
  }

  const renderItem = ({ item }: { item: { id: number; number: number } }) => (
    <View className="p-4 border-b border-gray-200">
      <Text className="text-lg">Item {item.number}</Text>
    </View>
  );

  return (
    <View className="flex-1">
      <AnimatedHeader
        scrollThreshold={HEADER_HEIGHT}
        scrollOffset={scrollOffset}
        header1={ChatsHeader1({ conversations })}
        header2={ChatsHeader2}
      />
      {conversations.length === 0 ? (
        <ConversationsEmpty />
      ) : (
        <Animated.FlatList
          data={fakeData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT }}
        />
      )}
    </View>
  );
};

export default ChatsView;
