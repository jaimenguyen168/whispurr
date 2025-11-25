import { Text, TouchableOpacity, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/src/types/convex";
import { Image } from "expo-image";
import React from "react";

export const ConversationHeader1 = ({ user }: { user: User }) => {
  return (
    <View className="px-4 py-3 flex-row justify-between items-center">
      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.dismiss()}
          className="rounded-full items-center justify-center size-10 bg-primary-100"
        >
          <Ionicons name="chevron-back" size={22} color="#081c15" />
        </TouchableOpacity>
        <Link href={"/profile"} asChild>
          <TouchableOpacity className="flex-row items-center gap-2">
            <View className="rounded-full items-center justify-center size-10 bg-primary-100 overflow-hidden">
              {user.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="font-bold text-primary-700 text-lg">
                  {user.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View>
              <Text className="font-bold text-primary-600">
                {user.username}
              </Text>
              <Text className="text-xs text-primary-600">Active 10m ago</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-row gap-2">
        <Link href={"/chats"} asChild>
          <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
            <Ionicons name="call-outline" size={18} color="#081c15" />
          </TouchableOpacity>
        </Link>

        <Link href={"/chats"} asChild>
          <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
            <Ionicons name="videocam-outline" size={22} color="#081c15" />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
          <Ionicons
            name="ellipsis-horizontal-outline"
            size={22}
            color="#081c15"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ConversationHeader2 = ({ user }: { user: User }) => {
  return (
    <View className="px-4 py-3 flex-row justify-between items-center">
      <TouchableOpacity
        onPress={() => router.dismiss()}
        className="rounded-full items-center justify-center size-10 bg-primary-100"
      >
        <Ionicons name="chevron-back" size={22} color="#081c15" />
      </TouchableOpacity>
      <View className="flex-1 items-center">
        <Text className="font-bold text-primary-600 mb-0.5">
          {user.username}
        </Text>
        <Link href={"/chats"} asChild>
          <TouchableOpacity className="flex-row items-center gap-0.5">
            <Text className="text-xs text-primary-600">Active 10m ago</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
        <Ionicons
          name="ellipsis-horizontal-outline"
          size={22}
          color="#081c15"
        />
      </TouchableOpacity>
    </View>
  );
};
