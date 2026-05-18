import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User } from "@/src/types/convex";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { Image } from "expo-image";
import { useThemeColors } from "@/src/providers/ThemeProvider";

const AddConversationView = () => {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const results = useQuery(
    api.functions.users.searchUsersByEmail,
    searchQuery.trim().length > 0 ? { emailQuery: searchQuery } : "skip",
  );

  const createConversation = useMutation(
    api.functions.conversations.createConversation,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleUserPress = async (user: User) => {
    try {
      router.dismiss();
      const conversationId = await createConversation({ receiverId: user._id });
      setTimeout(() => router.push(`/(chat)/${conversationId}`), 100);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center mx-4 py-3 border-b border-soft"
      activeOpacity={0.7}
      onPress={() => handleUserPress(item)}
    >
      <View className="rounded-full items-center justify-center size-12 bg-primary-100 mr-3 overflow-hidden">
        {item.imageUrl ? (
          <Image source={item.imageUrl} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Text className="font-bold text-primary-700 text-3xl">
            {item.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-lg text-main">{item.username}</Text>
        <Text className="text-base text-secondary mt-0.5">{item.email}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-6">
      {searchQuery.trim().length === 0 ? (
        <>
          <Ionicons name="mail-outline" size={48} color={ThemeColors.secondary.base} />
          <Text className="text-main text-lg font-semibold mt-4 text-center">
            Find someone by email
          </Text>
          <Text className="text-secondary text-base mt-2 text-center leading-5">
            Type an email address or username to search for people to chat with.
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="search" size={48} color={ThemeColors.secondary.base} />
          <Text className="text-secondary text-lg mt-4 text-center">
            No users found for "{searchQuery}"
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-app p-3">
      {/* Header */}
      <View className="px-3 py-3 flex-row justify-between items-center">
        <View className="size-8" />
        <Text className="font-bold text-2xl text-main">New Chat</Text>
        <TouchableOpacity
          onPress={() => router.dismiss()}
          className="rounded-full items-center justify-center size-8 bg-surface"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View className="px-3 py-3">
        <View className="flex-row items-center bg-card rounded-xl px-4 h-10">
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-3 text-secondary"
            placeholder="Search by email or username"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="ml-2"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color={ThemeColors.secondary.main} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results ?? []}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ flex: 1, paddingBottom: 100 }}
      />
    </View>
  );
};

export default AddConversationView;
