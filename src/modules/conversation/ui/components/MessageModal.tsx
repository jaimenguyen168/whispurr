import React, { useEffect } from "react";
import { View, Modal, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  SharedValue,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { MessageId, MessageWithReply, User } from "@/src/types/convex";

interface MessageLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MessageModalProps {
  visible: boolean;
  message: MessageWithReply;
  currentUser?: User;
  messageLayout: MessageLayout;
  isFromOtherUser: boolean;
  recentReaction?: string;
  scale: SharedValue<number>;
  translateY: SharedValue<number>;
  onClose: () => void;
  onReact?: (messageId: MessageId, emoji: string) => void;
  renderMessageContent: () => React.ReactNode;
  renderReactionsBar: () => React.ReactNode;
  renderContextMenu: () => React.ReactNode;
}

const MessageModal = ({
  visible,
  messageLayout,
  isFromOtherUser,
  scale,
  translateY,
  onClose,
  renderMessageContent,
  renderReactionsBar,
  renderContextMenu,
}: MessageModalProps) => {
  // Animation values
  const blurOpacity = useSharedValue(0);
  const modalMessageOpacity = useSharedValue(0);
  const reactionsBarOpacity = useSharedValue(0);
  const contextMenuOpacity = useSharedValue(0);

  // Start animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Start all modal animations together but staggered
      blurOpacity.value = withTiming(1, { duration: 300 });

      // Fade in modal message
      modalMessageOpacity.value = withDelay(
        100,
        withTiming(1, { duration: 200 }),
      );

      // Show reactions bar with bounce
      reactionsBarOpacity.value = withDelay(
        200,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.1, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );

      // Show context menu slightly after
      contextMenuOpacity.value = withDelay(
        200,
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 100 }),
        ),
      );
    }
  }, [visible]);

  // Animation styles
  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const modalMessageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalMessageOpacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const reactionsBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: reactionsBarOpacity.value,
    transform: [{ scale: reactionsBarOpacity.value }],
  }));

  const contextMenuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contextMenuOpacity.value,
    transform: [{ scale: contextMenuOpacity.value }],
  }));

  const handleClose = () => {
    // Animate everything out in reverse order
    contextMenuOpacity.value = withTiming(0, { duration: 200 });
    reactionsBarOpacity.value = withDelay(50, withTiming(0, { duration: 200 }));
    modalMessageOpacity.value = withDelay(
      100,
      withTiming(0, { duration: 200 }),
    );
    blurOpacity.value = withDelay(150, withTiming(0, { duration: 250 }));

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
      {/* Blur Background */}
      <Animated.View style={[{ flex: 1 }, blurAnimatedStyle]}>
        <BlurView intensity={50} tint="dark" style={{ flex: 1 }} />
      </Animated.View>

      {/* Animated Message on top of blur */}
      <Animated.View
        style={[
          modalMessageAnimatedStyle,
          {
            position: "absolute",
            left: messageLayout.x,
            top: messageLayout.y,
            width: messageLayout.width,
            zIndex: 10,
            paddingHorizontal: 20,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Reactions Bar */}
        <Animated.View style={[reactionsBarAnimatedStyle]}>
          {renderReactionsBar()}
        </Animated.View>

        {/* Message */}
        <View
          className={`my-3 ${isFromOtherUser ? "flex-row gap-2 items-end" : "items-end"}`}
        >
          {renderMessageContent()}
        </View>

        {/* Context Menu */}
        <Animated.View
          style={[
            contextMenuAnimatedStyle,
            { alignItems: isFromOtherUser ? "flex-start" : "flex-end" },
          ]}
          pointerEvents="box-none"
        >
          {renderContextMenu()}
        </Animated.View>
      </Animated.View>

      {/* Invisible pressable to close modal */}
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onPress={handleClose}
      />
    </Modal>
  );
};

export default MessageModal;
