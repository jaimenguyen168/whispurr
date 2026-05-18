import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icons } from "@/src/constants/Icons";
import OAuthButton from "@/src/modules/auth/ui/components/OAuthButton";
import AppButton from "@/src/components/AppButton";
import { router } from "expo-router";
import { ThemeColors } from "@/src/constants/ThemeColors";

interface AuthProvidersViewProps {
  onEmailLogin?: () => void;
  disabled?: boolean;
}

const AuthProvidersView = ({
  onEmailLogin,
  disabled = false,
}: AuthProvidersViewProps) => {
  const { whispurrIcon } = Icons;

  return (
    <SafeAreaView className="flex-1 bg-app">
      <View className="flex-1 justify-center items-center px-6">
        {/* App Branding Section */}
        <View className="items-center mb-8">
          {/* App Name */}
          <Text className="text-5xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2 uppercase leading-loose tracking-wide">
            Whis<Text className="text-primary-500 font-bold">purr</Text>
          </Text>

          {/* App Description */}
          <Text className="text-xl text-secondary-500 dark:text-secondary-400 text-center mb-8">
            Secure messaging for your conversations
          </Text>

          {/* App Icon */}
          <Image
            source={whispurrIcon}
            className="size-48"
            resizeMode="contain"
          />
        </View>

        {/* Continue With Section */}
        <View className="mb-6 self-stretch">
          <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 text-center mb-6">
            Continue With
          </Text>

          {/* OAuth Buttons */}
          <View className="gap-4">
            <OAuthButton provider="google" disabled={disabled} />

            {/* Email Login Button using AppButton */}
            <AppButton
              variant="outline"
              onPress={() => router.push("/login")}
              disabled={disabled}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons
                  name="mail-outline"
                  size={24}
                  color={ThemeColors.primary.main}
                />
                <Text className="text-primary-500 text-xl font-semibold">
                  Sign in with Email
                </Text>
              </View>
            </AppButton>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View className="items-center">
          <Text className="text-base text-gray-500 text-center leading-5">
            By continuing, you agree to our{" "}
            <Text
              className="text-primary-500 dark:text-primary-300 underline"
              onPress={() => router.push("/terms")}
            >
              Terms of Service
            </Text>
            {" "}and{" "}
            <Text
              className="text-primary-500 dark:text-primary-300 underline"
              onPress={() => router.push("/privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthProvidersView;
