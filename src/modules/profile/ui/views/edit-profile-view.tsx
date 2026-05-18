import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import ImagePicker, { ImageAsset } from "@/src/components/ImagePicker";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import AppButton from "@/src/components/AppButton";
import FormField from "@/src/modules/auth/ui/components/FormField";
import { validateFormData } from "@/src/utils/form-validator";
import BlurNavigationHeader from "@/src/components/BlurNavigationHeader";
import { useTheme, useThemeColors } from "@/src/providers/ThemeProvider";

const profileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
});

const EditProfileView = () => {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const user = useQuery(api.functions.users.getCurrentUser);
  const updateProfile = useMutation(api.functions.users.updateUserProfile);
  const { uploadImageToConvex } = useImageUpload();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] =
    useState<ImageAsset | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const validateForm = (data: { username: string }) => {
    const validation = validateFormData(profileSchema, data);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleUsernameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
    clearFieldError("username");
  };

  const handleProfileImageSelected = (image: ImageAsset) => {
    setSelectedProfileImage(image);
  };

  const handleImageError = (error: string) => {
    Alert.alert("Error", `Failed to select image: ${error}`);
  };

  const uploadImageToStorage = async (image: ImageAsset): Promise<string> => {
    try {
      return await uploadImageToConvex(image.uri);
    } catch (error) {
      console.error("Error uploading image to storage:", error);
      throw new Error("Failed to upload image to storage");
    }
  };

  const handleSave = async () => {
    const hasUsernameChanged = formData.username.trim() !== user?.username;
    const hasImageChanged = selectedProfileImage !== null;

    if (!hasUsernameChanged && !hasImageChanged) {
      Alert.alert("No Changes", "Please make some changes before saving.");
      return;
    }

    // Validate username if it changed
    if (hasUsernameChanged) {
      if (!validateForm({ username: formData.username.trim() })) {
        return;
      }
    }

    setIsLoading(true);
    try {
      const updateData: {
        username?: string;
        imageUrl?: string;
      } = {};

      if (hasUsernameChanged) {
        updateData.username = formData.username.trim();
      }

      if (hasImageChanged) {
        updateData.imageUrl = await uploadImageToStorage(selectedProfileImage);
      }

      await updateProfile(updateData);

      Alert.alert("Success", "Profile updated successfully!");
      setSelectedProfileImage(null);
      setErrors({}); // Clear any existing errors on successful save
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const hasChanges =
    formData.username.trim() !== user?.username ||
    selectedProfileImage !== null;

  const displayProfileImageUri = selectedProfileImage?.uri || user.imageUrl;

  return (
    <View className="flex-1 bg-app">
      <BlurNavigationHeader
        title="Edit Profile"
        statusBarStyle={isDark ? "light" : "dark"}
        blurType={isDark ? "dark" : "light"}
        leftComponent={
          <TouchableOpacity
            onPress={() => router.dismiss()}
            className="p-3 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        className="flex-1 bg-app"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 140 }}
      >
        {/* Profile Photo Section */}
        <View className="items-center pb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-primary-600/40 items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900">
              {displayProfileImageUri ? (
                <Image
                  source={{ uri: displayProfileImageUri }}
                  className="w-32 h-32"
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-bold text-primary-700 text-5xl">
                  {user.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            {/* Show indicator if image is changed */}
            {selectedProfileImage && (
              <View className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            )}
          </View>

          <ImagePicker
            onImageSelected={handleProfileImageSelected}
            onError={handleImageError}
            quality={0.8}
            allowsEditing={true}
          >
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={selectImage}
                className="mt-4 px-6 py-3 bg-card border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                  Edit Photo
                </Text>
              </TouchableOpacity>
            )}
          </ImagePicker>
        </View>

        {/* Form Fields */}
        <View className="px-6">
          {/* Username Field */}
          <View className="mb-6">
            <Text className="text-secondary text-base mb-2">Username</Text>
            <FormField
              label=""
              value={formData.username}
              onChangeText={handleUsernameChange}
              placeholder="Enter your username"
              editable={true}
              containerClassName="mb-0"
              labelClassName="hidden"
              inputClassName="py-4 px-4 font-medium text-main bg-card border border-soft rounded-2xl"
              error={errors.username}
            />
          </View>

          {/* Email Field (Read-only) */}
          <View className="mb-8">
            <Text className="text-secondary text-base mb-2">Email</Text>
            <View className="py-4 px-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <Text className="font-medium text-muted">{formData.email}</Text>
            </View>
            <Text className="text-muted text-sm mt-1">
              Email cannot be changed
            </Text>
          </View>
        </View>

        {/* Save Button - Only enabled when there are changes */}
        <View className="px-6">
          <AppButton onPress={handleSave} disabled={isLoading || !hasChanges}>
            <Text className="text-white text-xl font-semibold text-center">
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileView;
