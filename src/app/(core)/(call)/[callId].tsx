import { useLocalSearchParams } from "expo-router";
import CallView from "@/src/modules/call/ui/views/call-view";

export default function CallScreen() {
  const { callId, type } = useLocalSearchParams<{
    callId: string;
    type?: string;
  }>();

  return (
    <CallView
      callId={callId}
      callType={(type as "default" | "audio_room") ?? "default"}
    />
  );
}
