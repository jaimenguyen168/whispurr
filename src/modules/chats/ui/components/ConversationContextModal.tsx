import React, { useEffect } from "react";
import { View, Modal, Pressable, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  SharedValue,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useThemeColors } from "@/src/providers/ThemeProvider";

export interface ConversationContextAction {
  icon: string;
  iconLib?: "ionicons" | "antdesign";
  label: string;
  action: () => void;
  danger?: boolean;
}

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConversationContextModalProps {
  visible: boolean;
  itemLayout: Layout;
  scale: SharedValue<number>;
  translateY: SharedValue<number>;
  onClose: () => void;
  actions: ConversationContextAction[];
  renderItem: () => React.ReactNode;
}

const ConversationContextModal = ({
  visible,
  itemLayout,
  scale,
  translateY,
  onClose,
  actions,
  renderItem,
}: ConversationContextModalProps) => {
  const colors = useThemeColors();

  const blurOpacity = useSharedValue(0);
  const itemOpacity = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      blurOpacity.value = withTiming(1, { duration: 300 });
      itemOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
      menuOpacity.value = withDelay(
        200,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );
    }
  }, [visible]);

  const blurStyle = useAnimatedStyle(() => ({ opacity: blurOpacity.value }));

  const itemAnimatedStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ scale: menuOpacity.value }],
  }));

  const handleClose = () => {
    menuOpacity.value = withTiming(0, { duration: 200 });
    itemOpacity.value = withDelay(50, withTiming(0, { duration: 200 }));
    blurOpacity.value = withDelay(100, withTiming(0, { duration: 250 }));
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[{ flex: 1 }, blurStyle]}>
        <BlurView intensity={50} tint="dark" style={{ flex: 1 }} />
      </Animated.View>

      <Animated.View
        style={[
          itemAnimatedStyle,
          {
            position: "absolute",
            left: itemLayout.x,
            top: itemLayout.y,
            width: itemLayout.width,
            zIndex: 10,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Ghost conversation item */}
        <View className="bg-app mx-4 rounded-2xl overflow-hidden">
          {renderItem()}
        </View>

        {/* Context menu */}
        <Animated.View
          style={[menuStyle, { marginTop: 10 }]}
          pointerEvents="box-none"
        >
          <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden py-1 mx-4">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.action}
                activeOpacity={0.7}
                className={`flex-row items-center px-5 py-4 ${
                  index < actions.length - 1 ? "border-b border-soft" : ""
                }`}
              >
                {action.iconLib === "antdesign" ? (
                  <AntDesign
                    name={action.icon as any}
                    size={20}
                    color={action.danger ? "#ef4444" : colors.text}
                    style={{ marginRight: 14 }}
                  />
                ) : (
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={action.danger ? "#ef4444" : colors.text}
                    style={{ marginRight: 14 }}
                  />
                )}
                <Text
                  className={`text-lg font-medium ${
                    action.danger
                      ? "text-red-500"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Backdrop tap to close */}
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={handleClose}
      />
    </Modal>
  );
};

export default ConversationContextModal;
