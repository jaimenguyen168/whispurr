import React, { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  RingingCallContent,
  useCalls,
  type Call,
  type User as StreamUser,
} from "@stream-io/video-react-native-sdk";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

function RingingCalls() {
  // Only show the overlay for incoming ringing calls (callee side).
  // The caller's outgoing screen is handled by CallView — if we render
  // RingingCallContent for the caller too it overlays the custom OutgoingCall UI.
  const calls = useCalls().filter((c: Call) => c.ringing && !c.isCreatedByMe);
  const ringingCall = calls[0];
  if (!ringingCall) return null;

  return (
    <StreamCall call={ringingCall}>
      <SafeAreaView style={StyleSheet.absoluteFill}>
        <RingingCallContent />
      </SafeAreaView>
    </StreamCall>
  );
}

export function StreamVideoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(
    api.functions.users.getCurrentUser,
    isSignedIn ? undefined : "skip",
  );
  const generateToken = useAction(api.functions.stream.generateStreamToken);

  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!isSignedIn || !currentUser || !STREAM_API_KEY) return;
    if (client) return;

    let cancelled = false;

    const init = async () => {
      try {
        const { token, userId } = await generateToken();
        if (cancelled) return;

        const streamUser: StreamUser = {
          id: userId,
          name: currentUser.username || currentUser.email,
          image: currentUser.imageUrl ?? undefined,
        };

        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: streamUser,
          token,
        });

        setClient(videoClient);
      } catch (error) {
        console.error("[StreamVideoProvider] Failed to init client:", error);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, currentUser?._id]);

  useEffect(() => {
    if (!isSignedIn && client) {
      client.disconnectUser().catch(console.error);
      setClient(null);
    }
  }, [client, isSignedIn]);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <StreamVideo client={client}>
      {children}
      <RingingCalls />
    </StreamVideo>
  );
}
