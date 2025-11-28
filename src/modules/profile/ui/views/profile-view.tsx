import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  Switch,
} from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import SettingsItem from "@/src/modules/profile/ui/components/SettingsItem";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useThemeColors } from "@/src/providers/ThemeProvider";
import { ThemeColors } from "@/src/constants/ThemeColors";
import BlurNavigationHeader from "@/src/components/BlurNavigationHeader";

const SCROLL_THRESHOLD = 56;

const ProfileView = () => {
  const { signOut } = useAuth();
  const { setTheme, isDark } = useTheme();
  const colors = useThemeColors();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const currentUser = useQuery(api.functions.users.getCurrentUser);

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const handleCommunities = () => {
    router.push("/");
  };

  const handleFriends = () => {
    router.push("/");
  };

  const handleNotifications = () => {
    router.push("/");
  };

  const handleSounds = () => {
    router.push("/");
  };

  const handleUserGuide = () => {
    router.push("/");
  };

  const handleHelpFeedback = () => {
    router.push("/");
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
        onPress: () => signOut(),
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
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        style={{
          paddingTop: SCROLL_THRESHOLD + 12,
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
                  <Text className="text-primary-600 text-xl font-bold">
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

        {/* Settings Sections */}
        <View className="mb-4 rounded-xl overflow-hidden">
          <SettingsItem
            icon="people-outline"
            title="Friends"
            onPress={handleFriends}
          />
          <SettingsItem
            icon="globe-outline"
            title="Communities"
            onPress={handleCommunities}
            showBorder={false}
          />
        </View>

        {/* Preferences Section */}
        <View className="mb-4">
          <View className="py-3">
            <Text className="text-xl font-bold text-main">Preferences</Text>
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
              title="Notifications"
              onPress={handleNotifications}
            />
            <SettingsItem
              icon="volume-medium-outline"
              title="Sounds"
              onPress={handleSounds}
              showBorder={false}
            />
          </View>
        </View>

        {/* Other Section */}
        <View className="mb-8">
          <View className="py-3">
            <Text className="text-xl font-bold text-main">Other</Text>
          </View>
          <View className="rounded-xl overflow-hidden">
            <SettingsItem
              icon="book-outline"
              title="User Guide"
              onPress={handleUserGuide}
            />
            <SettingsItem
              icon="help-circle-outline"
              title="Help And Feedback"
              onPress={handleHelpFeedback}
            />
            <SettingsItem
              icon="log-out-outline"
              title="Log Out"
              onPress={handleLogOut}
              showChevron={true}
              iconColor="#ef4444"
              showBorder={false}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </Animated.ScrollView>
    </View>
  );
};

export default ProfileView;
