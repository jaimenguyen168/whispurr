import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/src/providers/ThemeProvider";
import { ConversationId, UserId } from "@/src/types/convex";
import { router } from "expo-router";

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Inappropriate content",
  "Fake account",
  "Other",
];

type Step = "reasons" | "confirm";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: UserId;
  reportedUsername: string;
  conversationId: ConversationId;
}

const ReportModal = ({
  visible,
  onClose,
  reportedUserId,
  reportedUsername,
  conversationId,
}: ReportModalProps) => {
  const colors = useThemeColors();
  const [step, setStep] = useState<Step>("reasons");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = useMutation(api.functions.moderation.submitReport);
  const blockUser = useMutation(api.functions.moderation.blockUser);
  const hideConversation = useMutation(api.functions.conversations.hideConversationForAll);

  const reset = () => {
    setStep("reasons");
    setSelectedReason(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return;
    setIsSubmitting(true);
    try {
      await submitReport({ reportedUserId, conversationId, reason: selectedReason });
      setStep("confirm");
    } catch {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser({ blockedUserId: reportedUserId });
    } catch {
      Alert.alert("Error", "Failed to block user.");
    }
  };

  const handleHideConversation = async () => {
    try {
      await hideConversation({ conversationId });
    } catch {
      Alert.alert("Error", "Failed to hide conversation.");
    }
  };

  const handleBlockAndHide = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all([handleBlock(), handleHideConversation()]);
      reset();
      onClose();
      router.dismissAll();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-app rounded-t-3xl pb-10">
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-soft" />
          </View>

          {step === "reasons" ? (
            <>
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4">
                <Text className="text-xl font-bold text-main">
                  Report {reportedUsername}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <Text className="text-base text-muted px-6 mb-4">
                Why are you reporting this conversation?
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {REPORT_REASONS.map((reason, index) => (
                  <TouchableOpacity
                    key={reason}
                    className={`flex-row items-center justify-between px-6 py-4 ${
                      index < REPORT_REASONS.length - 1 ? "border-b border-soft" : ""
                    }`}
                    activeOpacity={0.7}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text className="text-lg text-main">{reason}</Text>
                    <View
                      className={`size-5 rounded-full border-2 items-center justify-center ${
                        selectedReason === reason
                          ? "border-primary-500 bg-primary-500"
                          : "border-secondary-400 dark:border-secondary-600"
                      }`}
                    >
                      {selectedReason === reason && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="px-6 pt-6">
                <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${
                    selectedReason ? "bg-red-500" : "bg-soft"
                  }`}
                  activeOpacity={0.8}
                  disabled={!selectedReason || isSubmitting}
                  onPress={handleSubmitReport}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      className={`font-semibold text-lg ${
                        selectedReason ? "text-white" : "text-muted"
                      }`}
                    >
                      Submit Report
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Confirmation step */}
              <View className="items-center px-6 py-6 gap-3">
                <View className="size-16 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
                </View>
                <Text className="text-xl font-bold text-main text-center">
                  Report submitted
                </Text>
                <Text className="text-base text-muted text-center">
                  Thanks for letting us know. We'll review this conversation
                  and take appropriate action.
                </Text>
              </View>

              <View className="px-6 mt-2">
                <TouchableOpacity
                  className="rounded-xl py-4 items-center bg-red-500"
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                  onPress={handleBlockAndHide}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-semibold text-lg text-white">
                      Block & hide conversation
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;
