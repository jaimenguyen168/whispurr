import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Message } from "@/src/types/convex";

interface MessageReactionBadgeProps {
  reactions: Message["reactions"];
  onReactionPress?: (emoji: string) => void;
  className?: string;
  animateIcon?: string; // Optional icon to animate
}

const MessageReactionBadge = ({
  reactions,
  onReactionPress,
  className,
  animateIcon,
}: MessageReactionBadgeProps) => {
  const bounceScale = useSharedValue(1);
  const bounceTranslateY = useSharedValue(0);
  const lastAnimatedIcon = useRef<string | undefined>(animateIcon);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bounceScale.value },
      { translateY: bounceTranslateY.value },
    ],
  }));

  // Memoize reactionCounts to prevent unnecessary recalculations
  const reactionCounts = useMemo(() => {
    return reactions
      ? reactions.reduce(
          (acc, reaction) => {
            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        )
      : {};
  }, [reactions]);

  useEffect(() => {
    // Only animate if we have a new animateIcon and it exists in reactions
    if (
      animateIcon &&
      reactionCounts[animateIcon] &&
      animateIcon !== lastAnimatedIcon.current
    ) {
      lastAnimatedIcon.current = animateIcon;

      // Snappy bounce animation
      bounceScale.value = withSequence(
        withTiming(1.5, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: 250,
          easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Bouncy easing
        }),
      );

      bounceTranslateY.value = withSequence(
        withTiming(-16, {
          duration: 300,
          easing: Easing.out(Easing.quad), // Quick up
        }),
        withTiming(0, {
          duration: 250,
          easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Bouncy down
        }),
      );
    }

    // Reset the lastAnimatedIcon after animation completes
    if (animateIcon) {
      setTimeout(() => {
        lastAnimatedIcon.current = undefined;
      }, 600); // Reduced timeout since animation is faster
    }
  }, [animateIcon, reactionCounts]);

  if (!reactions || reactions.length === 0) return null;

  return (
    <View className={`${className}`} style={{ minWidth: 36 }}>
      <TouchableOpacity
        onPress={() => onReactionPress?.(Object.keys(reactionCounts)[0])}
        className="bg-card rounded-full px-2.5 py-1.5 gap-1 flex-shrink-0 flex-row items-center self-start border border-white dark:border-[#212529]"
      >
        {Object.entries(reactionCounts).map(([emoji, count], index) => (
          <React.Fragment key={emoji}>
            <Animated.Text
              className="text-xs flex-shrink-0"
              style={emoji === animateIcon ? animatedStyle : undefined}
            >
              {emoji}
            </Animated.Text>
          </React.Fragment>
        ))}
        {Object.entries(reactionCounts).length > 1 && (
          <Text className="text-secondary text-xs ml-1 font-medium">
            {Object.entries(reactionCounts).length}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MessageReactionBadge;
