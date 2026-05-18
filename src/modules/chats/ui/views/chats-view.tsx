import { View } from "react-native";
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
} from "@/src/modules/chats/ui/components/ChatsHeaders";
import { ConversationWithDetails } from "@/src/types/convex";
import ConversationItem from "@/src/modules/chats/ui/components/ConversationItem";
import { useAuth } from "@clerk/expo";

const HEADER_HEIGHT = 60;

const ChatsView = () => {
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const currentUser = useQuery(api.functions.users.getCurrentUser);

  const conversations = useQuery(
    api.functions.conversations.getConversationsForUser,
  );

  if (!conversations || !currentUser) {
    return <ConversationsLoading />;
  }

  const renderConversationItem = ({
    item,
  }: {
    item: ConversationWithDetails;
  }) => {
    return (
      <ConversationItem
        conversation={item}
        currentUserId={currentUser._id}
        clerkUserId={userId!}
      />
    );
  };

  const paddingTop =
    insets.top + (conversations.length === 0 ? 0 : HEADER_HEIGHT + 20);

  return (
    <View className="flex-1">
      <AnimatedHeader
        scrollThreshold={HEADER_HEIGHT}
        scrollOffset={scrollOffset}
        header1={ChatsHeader1({ conversations })}
        header2={<ChatsHeader2 />}
      />
      <Animated.FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item._id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
          paddingTop,
          paddingBottom: HEADER_HEIGHT,
        }}
        ListEmptyComponent={ConversationsEmpty}
      />
    </View>
  );
};

export default ChatsView;
