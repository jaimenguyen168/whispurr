import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const ConversationsEmpty = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="items-center gap-3">
        <View className="size-20 bg-primary-50 rounded-full items-center justify-center border-2 border-primary-200">
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={40}
            color="#52b788"
          />
        </View>
        <View className="items-center gap-1">
          <Text className="text-primary-700 font-bold text-xl">
            No conversations yet
          </Text>
          <Text className="text-primary-500 font-medium text-base text-center leading-6">
            Start your first conversation to see it appear here
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ConversationsEmpty;
