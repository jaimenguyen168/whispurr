import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BlurNavigationHeaderProps {
  title?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
  bottomComponent?: ReactNode;
  blurIntensity?: number;
  blurType?: "light" | "dark" | "regular";
  height?: number;
  titleStyle?: string;
  containerStyle?: string;
  bottomComponentStyle?: string;
  statusBarStyle?: "dark" | "light" | "auto";
}

const BlurNavigationHeader = ({
  title = "",
  leftComponent,
  rightComponent,
  secondRightComponent,
  bottomComponent,
  blurIntensity = 80,
  blurType = "light",
  height = 100,
  titleStyle = "text-2xl font-bold text-main tracking-wide",
  containerStyle = "",
  statusBarStyle = "auto",
}: BlurNavigationHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className={`absolute top-0 left-0 right-0 z-10 ${containerStyle}`}>
      <BlurView
        intensity={blurIntensity}
        tint={blurType}
        style={{
          paddingTop: insets.top - 10,
          minHeight: height,
        }}
      >
        <StatusBar style={statusBarStyle} />

        {/* Main Header Row - Fixed height */}
        <View
          className="flex-row items-center justify-between px-4"
          style={{ height: 56 }}
        >
          {/* Left Component */}
          <View className="flex-1 justify-center items-start">
            {leftComponent}
          </View>

          {/* Title (Center) */}
          <View className="flex-2 justify-center items-center">
            {title && <Text className={titleStyle}>{title}</Text>}
          </View>

          {/* Right Components */}
          <View className="flex-1 items-center justify-end flex-row gap-2">
            {secondRightComponent && <View>{secondRightComponent}</View>}
            {rightComponent && <View>{rightComponent}</View>}
          </View>
        </View>

        {/* Bottom Component - Search Bar */}
        {bottomComponent && (
          <View className="px-4 pb-4">{bottomComponent}</View>
        )}
      </BlurView>
    </View>
  );
};

export default BlurNavigationHeader;
