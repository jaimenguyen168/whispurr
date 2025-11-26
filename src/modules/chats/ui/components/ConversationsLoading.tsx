import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

const ConversationsLoading = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="items-center gap-2">
        <ActivityIndicator size="large" color="#40916c" />
        <Text className="text-primary-600 font-medium text-lg">
          Loading conversations...
        </Text>
      </View>
    </View>
  );
};

export default ConversationsLoading;
