import React, { ReactNode } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedHeaderProps {
  scrollOffset: SharedValue<number>;
  header1: ReactNode;
  header2: ReactNode;
  scrollThreshold?: number;
}

const AnimatedHeader = ({
  scrollOffset,
  header1,
  header2,
  scrollThreshold = 60,
}: AnimatedHeaderProps) => {
  const insets = useSafeAreaInsets();

  const header1Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollOffset.value,
      [0, scrollThreshold * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollOffset.value,
      [0, scrollThreshold * 0.6],
      [0, -10],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const header2Style = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollOffset.value,
      [scrollThreshold * 0.3, scrollThreshold],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollOffset.value,
      [scrollThreshold * 0.3, scrollThreshold],
      [-10, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollOffset.value,
      [0, scrollThreshold],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      shadowOpacity: opacity * 0.1,
      elevation: opacity * 4,
    };
  });

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 bg-white z-50"
      style={[
        shadowStyle,
        {
          paddingTop: insets.top,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
        },
      ]}
    >
      {/* Header 1 */}
      <Animated.View style={header1Style}>{header1}</Animated.View>

      {/* Header 2 */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={header2Style}
      >
        {header2}
      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedHeader;
