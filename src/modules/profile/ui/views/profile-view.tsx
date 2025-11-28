import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import SettingsItem from "@/src/modules/profile/ui/components/SettingsItem";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { ChatsHeader2 } from "@/src/modules/chats/ui/components/ChatsHeaders";
import AnimatedHeader from "@/src/components/AnimatedHeader";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import {
  ProfileHeader1,
  ProfileHeader2,
} from "@/src/modules/profile/ui/components/ProfileHeaders";

const ProfileView = () => {
  const { signOut } = useAuth();
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

  const handleAccountPrivacy = () => {
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
      <AnimatedHeader
        scrollThreshold={50}
        scrollOffset={scrollOffset}
        header1={ProfileHeader1}
        header2={<ProfileHeader2 user={currentUser} />}
      />
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-1 px-6"
        onScroll={scrollHandler}
        style={{
          paddingTop: 50,
        }}
      >
        {/* User Profile Header */}
        <TouchableOpacity
          onPress={handleEditProfile}
          className="bg-white py-4 mb-4 flex-row items-center justify-between pr-8"
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
              <Text className="text-2xl font-bold text-secondary-800 mb-1">
                {currentUser.username || "User"}
              </Text>
              <Text className="text-secondary-600 text-base">
                {currentUser.email}
              </Text>
            </View>
          </View>

          <Ionicons name="create-outline" size={24} color="black" />
        </TouchableOpacity>

        {/* Settings Sections */}
        <View className="mb-4">
          <SettingsItem
            icon="people-outline"
            title="Friends"
            onPress={handleFriends}
          />
          <SettingsItem
            icon="globe-outline"
            title="Communities"
            onPress={handleCommunities}
          />
        </View>

        {/* Preferences Section */}
        <View className="mb-4">
          <View className="py-3">
            <Text className="text-xl font-bold text-secondary-800">
              Preferences
            </Text>
          </View>
          <SettingsItem
            icon="lock-closed-outline"
            title="Account and Privacy"
            onPress={handleAccountPrivacy}
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
          />
        </View>

        {/* Other Section */}
        <View className="mb-8">
          <View className="py-3">
            <Text className="text-xl font-bold text-secondary-800">Other</Text>
          </View>
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
          />
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </Animated.ScrollView>
    </View>
  );
};

export default ProfileView;
