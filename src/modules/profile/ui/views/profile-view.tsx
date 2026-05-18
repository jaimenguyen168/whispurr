import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  Switch,
} from "react-native";
import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import SettingsItem from "@/src/modules/profile/ui/components/SettingsItem";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeColors } from "@/src/providers/ThemeProvider";
import { ThemeColors } from "@/src/constants/ThemeColors";
import BlurNavigationHeader from "@/src/components/BlurNavigationHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileView = () => {
  const { signOut } = useAuth();
  const { setTheme, isDark } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const clearPushToken = useMutation(api.functions.users.clearPushToken);

  const currentUser = useQuery(api.functions.users.getCurrentUser);
  const updateNotificationPreference = useMutation(
    api.functions.users.updateNotificationPreference,
  );

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const handleFriends = () => {
    router.push("/profile/friends");
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      await updateNotificationPreference({
        notificationsEnabled: value,
      });
    } catch (error) {
      console.error("Failed to update notification preference:", error);
      Alert.alert(
        "Error",
        "Failed to update notification settings. Please try again.",
      );
    }
  };

  const handleLogOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearPushToken();
            console.log("Push token cleared");
          } catch (error) {
            console.error("Failed to clear push token:", error);
          } finally {
            signOut();
          }
        },
      },
    ]);
  };

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-secondary-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <BlurNavigationHeader
        title="Profile"
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
      />
      <View
        className="flex-1 px-6"
        style={{
          paddingTop: insets.top + 68,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* User Profile Header */}
        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-transparent px-4 py-4 mb-4 flex-row items-center justify-between pr-10"
        >
          <View className="flex-row items-center">
            {/* Profile Image */}
            <View className="mr-4">
              {currentUser.imageUrl ? (
                <Image
                  source={{ uri: currentUser.imageUrl }}
                  className="w-16 h-16 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-primary-600 text-2xl font-bold">
                    {currentUser.username?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-main mb-1">
                {currentUser.username || "User"}
              </Text>
              <Text className="text-secondary text-base">
                {currentUser.email}
              </Text>
            </View>
          </View>

          <Ionicons
            name="create-outline"
            size={24}
            color={colors.tabIconSelected}
          />
        </TouchableOpacity>

        {/* Community Section */}
        <View className="mb-4">
          <View className="py-3">
            <Text className="text-2xl font-bold text-main">Community</Text>
          </View>
          <View className="rounded-xl overflow-hidden">
            <SettingsItem
              icon="people-outline"
              title="Friends"
              onPress={handleFriends}
              showBorder={false}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-4">
          <View className="py-3">
            <Text className="text-2xl font-bold text-main">Preferences</Text>
          </View>
          <View className="rounded-xl overflow-hidden">
            <SettingsItem
              icon="moon-outline"
              title="Dark Mode"
              showChevron={false}
              rightComponent={
                <Switch
                  value={isDark}
                  onValueChange={() => setTheme(isDark ? "light" : "dark")}
                  trackColor={{
                    false: colors.muted,
                    true: ThemeColors.primary.base,
                  }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={isDark ? "#374151" : "#E5E7EB"}
                />
              }
            />
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              showChevron={false}
              showBorder={false}
              rightComponent={
                <Switch
                  value={currentUser.notificationsEnabled ?? true}
                  onValueChange={handleNotificationToggle}
                  trackColor={{
                    false: colors.muted,
                    true: ThemeColors.primary.base,
                  }}
                  thumbColor="#ffffff"
                  ios_backgroundColor={isDark ? "#374151" : "#E5E7EB"}
                />
              }
            />
          </View>
        </View>

        <View className="flex-1" />
        <TouchableOpacity
          onPress={handleLogOut}
          className="rounded-xl bg-red-500 py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileView;
