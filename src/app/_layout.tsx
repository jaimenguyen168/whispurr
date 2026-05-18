import { Stack } from "expo-router";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import {
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { ConvexReactClient } from "convex/react";
import { ActivityIndicator, View } from "react-native";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { usePushNotifications } from "@/src/hooks/usePushNotifications";

import "react-native-get-random-values";
import * as ExpoStandardWebCrypto from "expo-standard-web-crypto";
import { StreamVideoProvider } from "@/src/providers/StreamVideoProvider";
import { GiphySDK } from "@giphy/react-native-sdk";

ExpoStandardWebCrypto.polyfillWebCrypto();

GiphySDK.configure({ apiKey: process.env.EXPO_PUBLIC_GIPHY_API_KEY! });

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <GestureHandlerRootView className="flex-1">
            <StreamVideoProvider>
              <GestureHandlerRootView>
                <ThemeProvider>
                  <RootAuthLayout />
                </ThemeProvider>
              </GestureHandlerRootView>
            </StreamVideoProvider>
          </GestureHandlerRootView>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const RootAuthLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  usePushNotifications(isSignedIn || false);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={ThemeColors.primary.main} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(core)" />
      </Stack.Protected>
    </Stack>
  );
};
