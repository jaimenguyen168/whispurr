import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
    } catch (e) {
      console.log("Error getting push token:", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token?.data;
}

export const usePushNotifications = (currentUser: any) => {
  // Fixed: Use generic type instead of deprecated Subscription
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);
  const updatePushToken = useMutation(api.functions.users.updatePushToken);

  useEffect(() => {
    if (!currentUser) return;

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        updatePushToken({
          pushToken: token,
        }).catch((error) => {
          console.error("Failed to update push token:", error);
        });
      }
    });

    // Listen for notifications received while app is running
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listen for user interactions with notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Notification response:",
          JSON.stringify(response, null, 2),
        );

        // Navigate to conversation when notification is tapped
        const { conversationId } =
          response.notification.request.content.data || {};
        if (conversationId) {
          console.log("Navigating to conversation:", conversationId);
          router.push(`/(chat)/${conversationId}`);
        } else {
          console.log("No conversation ID found in notification");
        }
      });

    return () => {
      // Fixed: Use optional chaining and correct variable names
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [currentUser, updatePushToken]);
};
