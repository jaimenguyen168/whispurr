import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Icons } from "@/src/constants/Icons";
import AppButton from "@/src/components/AppButton";
import { ThemeColors } from "@/src/constants/ThemeColors";
import FormField from "@/src/modules/auth/ui/components/FormField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const RegisterView = () => {
  const { whispurrIcon } = Icons;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    console.log("Register pressed", { email, password, confirmPassword });
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <View className="flex-1 px-6">
          {/* Close Button */}
          <View className="items-end pt-4 mb-8">
            <TouchableOpacity
              onPress={() => router.dismiss()}
              className="bg-white rounded-full p-2 shadow-sm"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons
                name="close"
                size={24}
                color={ThemeColors.secondary.main}
              />
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View className="items-center my-8">
            {/* App Name */}
            <Text className="text-4xl font-semibold text-secondary-700 mb-2 uppercase tracking-widest">
              Whis<Text className="text-primary-500 font-bold">purr</Text>
            </Text>

            {/* App Icon */}
            <Image
              source={whispurrIcon}
              className="size-32"
              resizeMode="contain"
            />
          </View>

          {/* Form Section */}
          <View className="flex-1">
            <Text className="text-2xl font-semibold text-secondary-700 text-center mb-4">
              Create Account
            </Text>

            {/* Email Field */}
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
            />

            {/* Password Field */}
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
              required
            />

            {/* Confirm Password Field */}
            <FormField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle={true}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              autoComplete="new-password"
              required
            />

            <View className="flex-row items-center justify-end mb-4 -mt-4">
              <Text className="text-red-500 font-light text-xs">
                (*) Required
              </Text>
            </View>

            {/* Register Button */}
            <AppButton
              variant="default"
              onPress={handleRegister}
              className="mb-6"
            >
              Create Account
            </AppButton>

            {/* Login Link */}
            <View className="items-center">
              <TouchableOpacity onPress={() => router.dismiss()}>
                <Text className="text-secondary-600 font-medium">
                  Already have an account?{" "}
                  <Text className="text-primary-500 font-bold">Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RegisterView;
