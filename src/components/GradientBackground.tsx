import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ViewStyle } from "react-native";

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientBackground = ({
  children,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: GradientBackgroundProps) => {
  return (
    <LinearGradient
      colors={["#40916c", "#2d6a4f", "#1b4332"]}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
