import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { User } from "@/src/types/convex";

export const ProfileHeader1 = (
  <View className="h-[50px] bg-app py-2">
    <View className="flex-1 items-center">
      <Text className="font-bold text-xl text-main mb-0.5">Profile</Text>
    </View>
  </View>
);

export const ProfileHeader2 = ({ user }: { user: User }) => {
  return (
    <View className="px-6 py-2 flex-row justify-center items-center bg-app">
      {/*<View className="size-10" />*/}
      <View className="flex-1 items-center">
        <Text className="font-bold text-xl text-main mb-0.5">Profile</Text>
        <Link href={"/chats"} asChild>
          <TouchableOpacity className="flex-row items-center gap-0.5">
            <Text className="text-sm text-accent">{user.username}</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {/*<Link href={"/chats/add-conversation"} asChild>*/}
      {/*  <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">*/}
      {/*    <Ionicons name="add" size={24} color="#081c15" />*/}
      {/*  </TouchableOpacity>*/}
      {/*</Link>*/}
    </View>
  );
};
