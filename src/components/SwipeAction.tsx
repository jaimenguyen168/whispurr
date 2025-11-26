import React from "react";
import Reanimated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { scheduleOnRN } from "react-native-worklets";
import { Ionicons } from "@expo/vector-icons";

interface SwipeActionProps {
  threshold: number;
  prog: SharedValue<number>;
  drag: SharedValue<number>;
}

const SwipeAction = ({ threshold, prog, drag }: SwipeActionProps) => {
  const hasReachedThresholdUp = useSharedValue(false);
  const hasReachedThresholdDown = useSharedValue(false);

  useAnimatedReaction(
    () => {
      return drag.value;
    },
    (dragValue) => {
      if (Math.abs(dragValue) > threshold && !hasReachedThresholdUp.value) {
        scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
        hasReachedThresholdUp.value = true;
        hasReachedThresholdDown.value = false;
      } else if (
        Math.abs(dragValue) < threshold &&
        !hasReachedThresholdDown.value
      ) {
        scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium);
        hasReachedThresholdUp.value = false;
        hasReachedThresholdDown.value = true;
      }
    },
  );

  const iconStyleAnimation = useAnimatedStyle(() => {
    const translateX = drag.value > -threshold ? drag.value + threshold : 0;

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Reanimated.View className="bg-red-500 flex-1 justify-center items-end">
      <Reanimated.View
        className="w-[50px] h-full justify-center items-center"
        style={iconStyleAnimation}
      >
        <Ionicons name="trash" size={24} color={"#fff"} />
      </Reanimated.View>
    </Reanimated.View>
  );
};

export default SwipeAction;
