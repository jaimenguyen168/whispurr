import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  AcceptCallButton,
  CallingState,
  CallContent,
  HangUpCallButton,
  IncomingCall,
  OutgoingCall,
  RejectCallButton,
  StreamCall,
  ToggleAudioPublishingButton,
  ToggleCameraFaceButton,
  ToggleVideoPublishingButton,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
  type Call,
  type CallControlProps,
  type IncomingCallControlsProps,
  type OutgoingCallControlsProps,
} from "@stream-io/video-react-native-sdk";

interface CallViewProps {
  callId: string;
  callType: "default" | "audio_room";
}

/**
 * CallView — sets up the call instance then hands off to CallUI.
 * The caller creates the call with ring: true and members set.
 * The callee arrives here after tapping accept in RingingCallContent.
 */
const CallView = ({ callId, callType }: CallViewProps) => {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;

    const setup = async () => {
      try {
        // Use an already-tracked call instance if the SDK has it (callee path).
        // Otherwise create a new one (caller path — already called getOrCreate
        // with ring:true in useStreamVideo, so just get the reference here).
        const existing = client.state.calls.find(
          (c) => c.id === callId && c.type === callType,
        );
        const callInstance = existing ?? client.call(callType, callId);

        if (!existing) {
          await callInstance.getOrCreate();
        }

        setCall(callInstance);
      } catch (err) {
        console.error("[CallView] Failed to set up call:", err);
        setError("Failed to start the call. Please try again.");
      }
    };

    setup();
  }, [client, callId, callType]);

  if (error) {
    return <ErrorCallUI error={error} />;
  }

  if (!call) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="white" />
          <Text className="mt-2 text-lg text-white">Starting call...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <StreamCall call={call}>
      <CallUI />
    </StreamCall>
  );
};

/**
 * CallUI — reactive call state UI inside StreamCall context.
 * Handles all states: ringing (in/out), joining, joined, left.
 */
function CallUI() {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const isCreatedByMe = call?.isCreatedByMe ?? false;

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      router.back();
    }
  }, [callingState]);

  if (
    [CallingState.RINGING, CallingState.JOINING, CallingState.IDLE].includes(
      callingState,
    )
  ) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        {isCreatedByMe ? (
          <OutgoingCall OutgoingCallControls={CustomOutgoingControls} />
        ) : (
          <IncomingCall IncomingCallControls={CustomIncomingControls} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
      <CallContent
        onHangupCallHandler={async () => {
          await call?.endCall();
        }}
        layout="spotlight"
        CallControls={CustomCallControls}
      />
    </SafeAreaView>
  );
}

function CustomOutgoingControls({
  onHangupCallHandler,
}: OutgoingCallControlsProps) {
  return (
    <View className="items-center gap-3 pb-12">
      <View className="bg-white/10 rounded-2xl px-6 py-2">
        <Text className="text-white/60 text-base">Tap to cancel</Text>
      </View>
      <HangUpCallButton size={100} onHangupCallHandler={onHangupCallHandler} />
    </View>
  );
}

function CustomIncomingControls({
  onAcceptCallHandler,
  onRejectCallHandler,
}: IncomingCallControlsProps) {
  return (
    <View className="flex-row justify-around items-center px-12 pb-12">
      <View className="items-center gap-3">
        <RejectCallButton size={72} onRejectCallHandler={onRejectCallHandler} />
        <Text className="text-white text-base font-medium">Decline</Text>
      </View>
      <View className="items-center gap-3">
        <AcceptCallButton onAcceptCallHandler={onAcceptCallHandler} />
        <Text className="text-white text-base font-medium">Accept</Text>
      </View>
    </View>
  );
}

/**
 * Custom call controls bar — replaces the default SDK controls row.
 * CallContent passes { onHangupCallHandler, landscape } per CallControlProps.
 */
function CustomCallControls({ onHangupCallHandler }: CallControlProps) {
  return (
    <View className="flex-row items-center justify-around px-8 py-6 bg-black/80">
      {/* Mic toggle */}
      <View className="items-center gap-2">
        <ToggleAudioPublishingButton />
        <Text className="text-white text-sm">Mic</Text>
      </View>

      {/* Hang up — center, larger, red */}
      <View className="items-center gap-2">
        <HangUpCallButton size={72} onHangupCallHandler={onHangupCallHandler} />
        <Text className="text-white text-sm">End</Text>
      </View>

      {/* Camera toggle */}
      <View className="items-center gap-2">
        <ToggleVideoPublishingButton />
        <Text className="text-white text-sm">Camera</Text>
      </View>

      {/* Flip camera */}
      <View className="items-center gap-2">
        <ToggleCameraFaceButton backgroundColor="#374151" />
        <Text className="text-white text-sm">Flip</Text>
      </View>
    </View>
  );
}

function ErrorCallUI({ error }: { error: string }) {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center gap-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-2 text-lg text-white text-center px-8">
          {error}
        </Text>
        <Pressable
          className="mt-4 rounded-xl bg-white px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-lg font-semibold text-black">Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default CallView;
