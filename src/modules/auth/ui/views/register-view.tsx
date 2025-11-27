import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Icons } from "@/src/constants/Icons";
import AppButton from "@/src/components/AppButton";
import { ThemeColors } from "@/src/constants/ThemeColors";
import FormField from "@/src/modules/auth/ui/components/FormField";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { validateFormData } from "@/src/utils/form-validator";
import { useSignUp } from "@clerk/clerk-expo";
import {
  getClerkErrorMessage,
  signupSchema,
} from "@/src/modules/auth/types/authSchema";

const RegisterView = () => {
  const { whispurrIcon } = Icons;
  const { signUp, setActive } = useSignUp();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const trimmedData = {
      ...formData,
      email: formData.email.trim(),
    };

    const validation = validateFormData(signupSchema, trimmedData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting sign up with Clerk...");

      const result = await signUp?.create({
        emailAddress: trimmedData.email,
        password: trimmedData.password,
      });

      console.log("SignUp result:", result);

      if (result?.status === "complete") {
        console.log("SignUp successful!");
        await setActive!({ session: result.createdSessionId });
      } else {
        Alert.alert(
          "Registration Incomplete",
          "Additional verification steps may be required. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      const errorMessage = getClerkErrorMessage(error, "email");

      Alert.alert("Registration Failed", errorMessage, [
        { text: "OK", style: "default" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleLogin = () => {
    router.push("/login");
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

            {/* General Error Message */}
            {errors.general && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-sm font-medium">
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <FormField
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
              error={errors.email}
            />

            {/* Password Field */}
            <FormField
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
              required
              error={errors.password}
            />

            {/* Confirm Password Field */}
            <FormField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              showPasswordToggle={true}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              autoComplete="new-password"
              required
              error={errors.confirmPassword}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </AppButton>

            {/* Login Link */}
            <View className="items-center">
              <TouchableOpacity onPress={handleLogin}>
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
