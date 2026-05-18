import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeColors } from "@/src/providers/ThemeProvider";
import BlurNavigationHeader from "@/src/components/BlurNavigationHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FriendsView = () => {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const friends = useQuery(api.functions.users.getFriends);

  return (
    <View className="flex-1">
      <BlurNavigationHeader
        title="Friends"
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingTop: insets.top + 68 }}
        ListEmptyComponent={
          friends !== undefined ? (
            <View className="flex-1 items-center justify-center mt-24 gap-3">
              <Ionicons name="people-outline" size={48} color={colors.muted} />
              <Text className="text-lg text-muted">No friends yet</Text>
              <Text className="text-base text-muted text-center px-8">
                Start a conversation to see your friends here
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center px-6 py-3 bg-transparent"
            activeOpacity={0.7}
            onPress={() => router.push(`/(chat)/${item.conversationId}`)}
          >
            <View className="rounded-full items-center justify-center size-12 bg-primary-100 dark:bg-primary-400 mr-4 overflow-hidden">
              {item.imageUrl ? (
                <Image
                  source={item.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="font-bold text-primary-700 text-xl">
                  {item.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-lg text-main">
                {item.username}
              </Text>
              <Text className="text-base text-muted">{item.email}</Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-soft mx-6" />
        )}
      />
    </View>
  );
};

export default FriendsView;
