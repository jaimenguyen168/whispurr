import { useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { router } from "expo-router";
import { useStreamVideoClient } from "@stream-io/video-react-native-sdk";

type CallType = "default" | "audio_room";

interface UseStreamVideoReturn {
  isReady: boolean;
  startCall: (params: {
    callId: string;
    callType?: CallType;
    receiverConvexUserId: Id<"users">;
  }) => Promise<void>;
  joinCall: (params: {
    callId: string;
    callType?: CallType;
  }) => Promise<void>;
}

/**
 * useStreamVideo
 *
 * Reads the StreamVideoClient already initialized by StreamVideoProvider.
 *
 * How Stream user registration works:
 * - Users are registered in Stream automatically via WebSocket handshake
 *   when StreamVideoProvider connects them (on app open)
 * - There is no REST endpoint to pre-create users in the Video API
 * - The receiver must have opened the app at least once to be registered
 * - Once registered, Stream can ring them even when offline via push notifications
 *
 * For the call members list: only add the receiver's Stream user ID.
 * The caller is implicitly included as the call creator by Stream.
 */
export function useStreamVideo(): UseStreamVideoReturn {
  const client = useStreamVideoClient();

  const startCall = useCallback(
    async ({
      callId,
      callType = "default",
      receiverConvexUserId,
    }: {
      callId: string;
      callType?: CallType;
      receiverConvexUserId: Id<"users">;
    }) => {
      if (!client) {
        console.warn("[StreamVideo] Client not ready — is StreamVideoProvider mounted?");
        return;
      }

      try {
        const call = client.call(callType, callId);

        // Ring the receiver. Stream requires them to have connected via the SDK
        // at least once before (which happens when they open the app).
        await call.getOrCreate({
          ring: true,
          data: {
            members: [{ user_id: receiverConvexUserId }],
          },
        });

        router.push(`/(core)/(call)/${callId}?type=${callType}`);
      } catch (error) {
        console.error("[StreamVideo] Failed to start call:", error);
        throw error;
      }
    },
    [client],
  );

  const joinCall = useCallback(
    async ({ callId, callType = "default" }: { callId: string; callType?: CallType }) => {
      router.push(`/(core)/(call)/${callId}?type=${callType}`);
    },
    [],
  );

  return {
    isReady: !!client,
    startCall,
    joinCall,
  };
}
