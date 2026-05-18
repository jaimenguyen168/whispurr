// import { icons } from "@/constants/icons";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { OAuthConfig, OAuthProvider } from "@/src/modules/auth/types/oauth";

export const oauthConfigs: Record<OAuthProvider, OAuthConfig> = {
  google: {
    strategy: "oauth_google",
    label: "Sign in with Google",
    ionIcon: "logo-google",
    iconColor: ThemeColors.secondary.darkest,
    backgroundColor: "bg-secondary-50 dark:bg-secondary-700",
    textColor: "text-secondary-800 dark:text-secondary-50",
    borderColor: "border-secondary-300 dark:border-secondary-600",
    // icon: icons.googleIcon,
  },
  apple: {
    strategy: "oauth_apple",
    label: "Sign in with Apple",
    ionIcon: "logo-apple",
    iconColor: ThemeColors.secondary.lightest,
    backgroundColor: "bg-black",
    textColor: "text-white",
    borderColor: "",
  },
};
