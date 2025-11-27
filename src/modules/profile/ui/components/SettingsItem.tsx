import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
  showChevron?: boolean;
  iconColor?: string;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  showBadge = false,
  badgeText,
  showChevron = true,
  iconColor = ThemeColors.secondary.main,
}: SettingsItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 bg-transparent border-b border-secondary-100/80"
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="mr-4">
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      {/* Title */}
      <Text className="flex-1 text-base font-medium text-secondary-800">
        {title}
      </Text>

      {/* Badge */}
      {showBadge && badgeText && (
        <View className="bg-red-500 rounded-full min-w-[24px] h-6 items-center justify-center mr-3">
          <Text className="text-white text-xs font-bold px-1">{badgeText}</Text>
        </View>
      )}

      {/* Chevron */}
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={ThemeColors.secondary.medium}
        />
      )}
    </TouchableOpacity>
  );
};

export default SettingsItem;
