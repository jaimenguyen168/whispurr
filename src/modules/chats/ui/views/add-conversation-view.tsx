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

const AddConversationView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const users = useQuery(api.functions.users.getUsers);
  const createConversation = useMutation(
    api.functions.conversations.createConversation,
  );

  console.log(users);

  const filteredUsers =
    users?.filter(
      (user: User) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleUserPress = async (user: User) => {
    try {
      router.dismiss();

      const conversationId = await createConversation({
        receiverId: user._id,
      });

      setTimeout(() => {
        router.push(`/(chat)/${conversationId}`);
      }, 100);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      activeOpacity={0.7}
      onPress={() => handleUserPress(item)}
    >
      <View className="rounded-full items-center justify-center size-12 bg-primary-100 mr-3 overflow-hidden">
        {item.imageUrl ? (
          <Image
            source={item.imageUrl}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text className="font-bold text-primary-700 text-2xl">
            {item.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-base text-gray-900">
          {item.username}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">{item.email}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <Ionicons name="search" size={48} color={ThemeColors.secondary.base} />
      <Text className="text-secondary-500 text-base mt-4 text-center">
        {searchQuery
          ? `No users found for "${searchQuery}"`
          : "Start typing to search users"}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white p-3">
      {/* Header */}
      <View className="px-3 py-3 flex-row justify-between items-center">
        <View className="size-8" />
        <Text className="font-bold text-xl text-gray-900">New Chat</Text>
        <TouchableOpacity
          onPress={() => router.dismiss()}
          className="rounded-full items-center justify-center size-8 bg-primary-100"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={ThemeColors.primary.darker} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View className="px-3 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-10">
          <Ionicons
            name="search"
            size={20}
            color={ThemeColors.secondary.main}
          />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search by username or email"
            placeholderTextColor={ThemeColors.secondary.base}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="ml-2"
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={ThemeColors.secondary.main}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 100,
        }}
      />
    </View>
  );
};

export default AddConversationView;
