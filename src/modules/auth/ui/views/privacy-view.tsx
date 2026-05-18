import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColors } from "@/src/providers/ThemeProvider";

const PrivacyView = () => {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-app">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-soft">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-main">Privacy Policy</Text>
        <View className="size-8" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}

        contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}
      >
        <Text className="text-sm text-muted mb-8">Last updated: May 2025</Text>

        {/* Encryption highlight */}
        <View className="bg-primary-50 border border-primary-200 rounded-2xl px-4 py-4 mb-8 flex-row items-start gap-3">
          <Ionicons name="shield-checkmark" size={22} color="#40916c" style={{ marginTop: 1 }} />
          <View className="flex-1">
            <Text className="text-primary-700 font-bold text-base mb-1">We Cannot Read Your Messages</Text>
            <Text className="text-primary-600 text-base leading-5">
              Messages are end-to-end encrypted with AES-256. Your encryption keys never leave your device. Not us, not anyone — only you and the recipient can read your conversations.
            </Text>
          </View>
        </View>

        <View className="gap-6">
          <View>
            <Text className="font-bold text-lg text-main mb-2">1. What We Collect</Text>
            <Text className="text-base text-secondary leading-6">
              We collect only what is necessary: your email or OAuth identifier, display name, and optional profile photo. We do not collect your contacts, location, or any unrelated data.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-lg text-main mb-2">2. What We Cannot Access</Text>
            <Text className="text-base text-secondary leading-6">
              Message content is encrypted on your device before transmission. We store only ciphertext. Without your local key, messages are permanently unreadable to us.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-lg text-main mb-2">3. How We Use Your Data</Text>
            <Text className="text-base text-secondary leading-6">
              Your account data is used solely to identify you and deliver messages. We do not sell, share, or use your data for advertising — ever.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-lg text-main mb-2">4. Push Notifications</Text>
            <Text className="text-base text-secondary leading-6">
              If enabled, we store your device push token to deliver alerts. Notification payloads contain only a sender name — never message content.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-lg text-main mb-2">5. Your Rights</Text>
            <Text className="text-base text-secondary leading-6">
              You can delete your account at any time from settings. Upon deletion, your profile and all encrypted messages are permanently removed from our servers.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-lg text-main mb-2">6. Contact</Text>
            <Text className="text-base text-secondary leading-6">privacy@whispurr.app</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyView;
