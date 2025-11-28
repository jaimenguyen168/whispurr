import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { useThemeColors } from "@/src/providers/ThemeProvider";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
  iconColor?: string;
  rightComponent?: React.ReactNode;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  showChevron = true,
  iconColor = ThemeColors.secondary.main,
  rightComponent,
}: SettingsItemProps) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 border-b bg-card border-soft px-4"
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="mr-4">
        <Ionicons
          name={icon}
          size={24}
          color={iconColor || colors.tabIconSelected}
        />
      </View>

      {/* Title */}
      <Text className="flex-1 text-base font-medium text-secondary">
        {title}
      </Text>

      {/* Right Component or Chevron */}
      {rightComponent ? (
        rightComponent
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      ) : null}
    </TouchableOpacity>
  );
};

export default SettingsItem;
