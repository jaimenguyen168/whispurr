import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Conversation } from "@/src/types/convex";
import { Image } from "expo-image";
import { Icons } from "@/src/constants/Icons";

export const ChatsHeader1 = ({
  conversations,
}: {
  conversations: Conversation[];
}) => {
  const { whispurrIcon } = Icons;
  return (
    <View className="px-6 pb-3 flex-row justify-between items-center">
      <Link href={"/chats"} asChild>
        <TouchableOpacity className="flex-row items-center rounded-2xl gap-2">
          <Image
            source={whispurrIcon}
            style={{
              width: 48,
              height: 48,
            }}
          />
          <Text className="font-bold text-xl text-primary-600">Whispurr</Text>
        </TouchableOpacity>
      </Link>

      <View className="flex-row gap-4">
        {conversations.length > 0 && (
          <Link href={"/chats/add-conversation"} asChild>
            <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
              <Ionicons name="search" size={20} color="#081c15" />
            </TouchableOpacity>
          </Link>
        )}
        <Link href={"/chats/add-conversation"} asChild>
          <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
            <Ionicons name="add" size={24} color="#081c15" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export const ChatsHeader2 = (
  <View className="px-6 pb-3 flex-row justify-between items-center">
    <View className="size-10" />
    <View className="flex-1 items-center">
      <Text className="font-bold text-xl text-primary-600 mb-0.5">
        Whispurr
      </Text>
      <Link href={"/chats"} asChild>
        <TouchableOpacity className="flex-row items-center gap-0.5">
          <Text className="text-sm text-primary-600">Chats</Text>
        </TouchableOpacity>
      </Link>
    </View>
    <Link href={"/chats/add-conversation"} asChild>
      <TouchableOpacity className="rounded-full items-center justify-center size-10 bg-primary-100">
        <Ionicons name="add" size={24} color="#081c15" />
      </TouchableOpacity>
    </Link>
  </View>
);
