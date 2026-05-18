import React, { useCallback, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/expo";
import {
  View,
  Platform,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OAuthProvider } from "@/src/modules/auth/types/oauth";
import { oauthConfigs } from "@/src/modules/auth/constants/oauth";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

interface OAuthButtonProps {
  provider: OAuthProvider;
  disabled?: boolean;
}

const OAuthButton = ({ provider, disabled = false }: OAuthButtonProps) => {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);
  const scheme = useColorScheme();

  const config = oauthConfigs[provider];
  const iconColor = scheme === "dark" ? "#f8f9fa" : config.iconColor;

  const onPress = useCallback(async () => {
    if (disabled || isLoading) return;

    console.log(`OAuth button pressed ${provider}`);
    setIsLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: config.strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      console.log("SSO Flow result:", { createdSessionId });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      } else {
        console.log(`${provider} OAuth failed - no session created`);
      }
    } catch (err) {
      console.log(`${provider} OAuth error:`, JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, config.strategy, provider, disabled, isLoading]);

  const isButtonDisabled = disabled || isLoading;

  const buttonClasses = [
    config.backgroundColor,
    config.borderColor ? `border ${config.borderColor}` : "",
    "rounded-2xl py-3",
    isButtonDisabled ? "opacity-50" : "",
    config.textColor,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${buttonClasses}`}
      activeOpacity={isButtonDisabled ? 1 : 0.8}
      disabled={isButtonDisabled}
    >
      <View className="flex-row items-center justify-center py-1 gap-2">
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={iconColor}
          />
        ) : (
          <>
            {config.icon ? (
              <Image source={config.icon} className="size-6" />
            ) : config.ionIcon ? (
              <Ionicons
                name={config.ionIcon}
                size={24}
                color={iconColor}
              />
            ) : null}
          </>
        )}

        <Text className={`text-xl font-semibold ${config.textColor}`}>
          {isLoading ? "Signing in..." : config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default OAuthButton;
