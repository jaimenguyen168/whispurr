import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeColors } from "@/src/providers/ThemeProvider";

const TermsView = () => {
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-app">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-soft">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-main">Terms of Service</Text>
        <View className="size-8" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}

        contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}
      >
        <Text className="text-xs text-muted mb-8">Last updated: May 2025</Text>

        {/* Encryption highlight */}
        <View className="bg-primary-50 border border-primary-200 rounded-2xl px-4 py-4 mb-8 flex-row items-start gap-3">
          <Ionicons name="lock-closed" size={22} color="#40916c" style={{ marginTop: 1 }} />
          <View className="flex-1">
            <Text className="text-primary-700 font-bold text-sm mb-1">End-to-End Encrypted</Text>
            <Text className="text-primary-600 text-sm leading-5">
              Your messages are encrypted on your device before being sent. Nobody — not even Whispurr — can read your conversations.
            </Text>
          </View>
        </View>

        <View className="gap-6">
          <View>
            <Text className="font-bold text-base text-main mb-2">1. Acceptance</Text>
            <Text className="text-sm text-secondary leading-6">
              By downloading, installing, or using Whispurr, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you must not use the app. These terms apply to all users of the service.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">2. Eligibility</Text>
            <Text className="text-sm text-secondary leading-6">
              You must be at least 13 years of age to use Whispurr. By using the app, you represent that you meet this requirement. If you are under 18, you should review these terms with a parent or guardian.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">3. Use of Service</Text>
            <Text className="text-sm text-secondary leading-6">
              You agree to use Whispurr only for lawful purposes and in a manner consistent with all applicable laws. You must not harass, threaten, impersonate, or distribute harmful, illegal, or offensive content to other users. Any misuse may result in immediate account suspension.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">4. Encryption & Privacy</Text>
            <Text className="text-sm text-secondary leading-6">
              All messages sent through Whispurr are protected with AES-256 end-to-end encryption. Encryption keys are generated and stored exclusively on your device and are never transmitted to our servers. We have zero technical ability to access your message content — this is enforced by design, not merely by policy.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">5. Account Responsibility</Text>
            <Text className="text-sm text-secondary leading-6">
              You are solely responsible for maintaining the security of your account credentials. Do not share your login information with others. Any activity that occurs under your account is your responsibility. If you suspect unauthorized access, change your credentials immediately.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">6. Intellectual Property</Text>
            <Text className="text-sm text-secondary leading-6">
              All content, design, logos, and software within Whispurr are the intellectual property of Whispurr and its developers. You may not reproduce, modify, or distribute any part of the app without prior written consent.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">7. Disclaimer of Warranties</Text>
            <Text className="text-sm text-secondary leading-6">
              Whispurr is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or free of harmful components. Your use of the service is at your own risk.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">8. Limitation of Liability</Text>
            <Text className="text-sm text-secondary leading-6">
              To the maximum extent permitted by law, Whispurr shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the service.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">9. Termination</Text>
            <Text className="text-sm text-secondary leading-6">
              We reserve the right to suspend or terminate accounts that violate these terms without prior notice. You may delete your account at any time from the app settings, which will permanently remove your data from our servers.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">10. Changes to Terms</Text>
            <Text className="text-sm text-secondary leading-6">
              We may update these terms from time to time. We will notify you of significant changes via the app. Continued use of Whispurr after changes are posted constitutes your acceptance of the updated terms.
            </Text>
          </View>

          <View>
            <Text className="font-bold text-base text-main mb-2">11. Contact</Text>
            <Text className="text-sm text-secondary leading-6">support@whispurr.app</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsView;
