import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface AppButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

const AppButton = ({
  children,
  variant = "default",
  loading = false,
  disabled = false,
  className = "",
  ...props
}: AppButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary-400";
      case "outline":
        return "bg-secondary-50 dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600";
      default:
        return "bg-primary-600";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return "text-secondary-400";
      case "secondary":
      default:
        return "text-white";
    }
  };

  const isDisabled = disabled || loading;
  const opacityClass = isDisabled ? "opacity-70" : "";

  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 ${getVariantClasses()} ${opacityClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={`text-center font-semibold text-lg ${getTextColor()}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
