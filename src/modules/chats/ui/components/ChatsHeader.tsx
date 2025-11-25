import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Conversation } from "@/src/types/convex";

export const ChatsHeader1 = ({
  conversations,
}: {
  conversations: Conversation[];
}) => {
  return (
    <View className="px-4 py-3 flex-row justify-between items-center">
      <Link href={"/chats"} asChild>
        <TouchableOpacity className="flex-row items-center rounded-2xl gap-2 ml-1">
          <View className="rounded-full items-center justify-center size-10 bg-primary-100">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#081c15"
            />
          </View>
          <Text className="font-bold text-lg text-primary-600">Whispurr</Text>
        </TouchableOpacity>
      </Link>

      <View className="flex-row gap-2">
        {conversations.length > 0 && (
          <Link href={"/chats/add-conversation"} asChild>
            <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
              <Ionicons name="search" size={18} color="#081c15" />
            </TouchableOpacity>
          </Link>
        )}
        <Link href={"/chats/add-conversation"} asChild>
          <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
            <Ionicons name="add" size={22} color="#081c15" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export const ChatsHeader2 = (
  <View className="px-4 py-3 flex-row justify-between items-center">
    <View className="flex-1 items-center pl-10">
      <Text className="font-bold text-lg text-primary-600 mb-0.5">
        Whispurr
      </Text>
      <Link href={"/chats"} asChild>
        <TouchableOpacity className="flex-row items-center gap-0.5">
          <Text className="text-xs text-primary-600">Chats</Text>
        </TouchableOpacity>
      </Link>
    </View>
    <View className="flex-row gap-2">
      <Link href={"/chats/add-conversation"} asChild>
        <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
          <Ionicons name="add" size={22} color="#081c15" />
        </TouchableOpacity>
      </Link>
    </View>
  </View>
);
