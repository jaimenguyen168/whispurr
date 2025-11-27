import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/src/types/convex";
import { Image } from "expo-image";
import React from "react";
import { Button, ContextMenu, Host } from "@expo/ui/swift-ui";

interface ConversationHeaderActions {
  onPin?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export const ConversationHeader1 = ({
  user,
  onBack,
  actions = {},
}: {
  user: User;
  onBack?: () => void;
  actions?: ConversationHeaderActions;
}) => {
  const { onPin, onReport, onDelete, onCall, onVideoCall } = actions;

  return (
    <View className="px-4 pb-3 flex-row justify-between items-center gap-2 w-full">
      <View className="flex-row gap-2 flex-1 min-w-0">
        <TouchableOpacity
          onPress={onBack}
          className="rounded-full items-center justify-center size-10 bg-transparent -ml-1"
        >
          <Ionicons name="chevron-back" size={28} color="#081c15" />
        </TouchableOpacity>
        <Link href={"/profile"} asChild>
          <TouchableOpacity className="flex-row items-center gap-3 flex-1 min-w-0">
            <View className="rounded-full items-center justify-center size-12 bg-primary-100 overflow-hidden">
              {user.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text className="font-bold text-primary-700 text-xl">
                  {user.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View className="flex-1 min-w-0 overflow-hidden">
              <Text
                className="font-bold text-primary-600 text-lg"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user.username}
              </Text>
              <Text className="text-sm text-primary-600">Active 10m ago</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      <View className="flex-row gap-3 flex-shrink-0">
        <TouchableOpacity
          onPress={onCall || (() => console.log("Start voice call"))}
          className="rounded-full items-center justify-center size-10 bg-primary-100"
        >
          <Ionicons name="call-outline" size={20} color="#081c15" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVideoCall || (() => console.log("Start video call"))}
          className="rounded-full items-center justify-center size-10 bg-primary-100"
        >
          <Ionicons name="videocam-outline" size={22} color="#081c15" />
        </TouchableOpacity>

        <View className="rounded-full items-center justify-center size-10 bg-primary-100">
          <Host matchContents>
            <ContextMenu>
              <ContextMenu.Items>
                <Button
                  systemImage="pin.fill"
                  onPress={onPin || (() => console.log("Pin conversation"))}
                >
                  Pin conversation
                </Button>
                <Button
                  systemImage="flag.fill"
                  onPress={onReport || (() => console.log("Report user"))}
                >
                  Report user
                </Button>
                <Button
                  systemImage="trash.fill"
                  onPress={
                    onDelete || (() => console.log("Delete conversation"))
                  }
                >
                  Delete conversation
                </Button>
              </ContextMenu.Items>
              <ContextMenu.Trigger>
                <View className="rounded-full items-center justify-center size-10 bg-primary-100">
                  <Ionicons
                    name="ellipsis-horizontal-outline"
                    size={24}
                    color="#081c15"
                  />
                </View>
              </ContextMenu.Trigger>
            </ContextMenu>
          </Host>
        </View>
      </View>
    </View>
  );
};

export const ConversationHeader2 = ({
  user,
  onBack,
  actions = {},
}: {
  user: User;
  onBack?: () => void;
  actions?: ConversationHeaderActions;
}) => {
  const { onPin, onReport, onDelete, onCall, onVideoCall } = actions;

  return (
    <View className="px-4 pb-3 flex-row justify-between items-center">
      <TouchableOpacity
        onPress={onBack}
        className="rounded-full items-center justify-center size-10 bg-transparent -ml-1"
      >
        <Ionicons name="chevron-back" size={28} color="#081c15" />
      </TouchableOpacity>
      <View className="flex-1 items-center">
        <Text className="font-bold text-primary-600 text-lg">
          {user.username}
        </Text>
        <Text className="text-sm text-primary-600">Active 10m ago</Text>
      </View>

      <View className="rounded-full items-center justify-center size-10 bg-primary-100 pb-2">
        <Host matchContents>
          <ContextMenu>
            <ContextMenu.Items>
              <Button
                systemImage="phone.fill"
                onPress={onCall || (() => console.log("Start voice call"))}
              >
                Voice call
              </Button>
              <Button
                systemImage="video.fill"
                onPress={onVideoCall || (() => console.log("Start video call"))}
              >
                Video call
              </Button>
              <Button
                systemImage="pin.fill"
                onPress={onPin || (() => console.log("Pin conversation"))}
              >
                Pin conversation
              </Button>
              <Button
                systemImage="flag.fill"
                onPress={onReport || (() => console.log("Report user"))}
              >
                Report user
              </Button>
              <Button
                systemImage="trash.fill"
                onPress={onDelete || (() => console.log("Delete conversation"))}
              >
                Delete conversation
              </Button>
            </ContextMenu.Items>
            <ContextMenu.Trigger>
              <Ionicons
                name="ellipsis-horizontal-outline"
                size={24}
                color="#081c15"
              />
            </ContextMenu.Trigger>
          </ContextMenu>
        </Host>
      </View>
    </View>
  );
};
