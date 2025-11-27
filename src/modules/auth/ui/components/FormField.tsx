import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "@/src/constants/ThemeColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

const FormField = ({
  label,
  error,
  required = false,
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  containerClassName = "mb-6",
  inputClassName = "bg-card border border-soft rounded-2xl px-4 py-4 text-base text-main",
  labelClassName = "text-secondary font-medium mb-2",
  ...props
}: FormFieldProps) => {
  const hasPasswordToggle = showPasswordToggle && onTogglePassword;
  const finalInputClassName = hasPasswordToggle
    ? `${inputClassName} pr-12`
    : inputClassName;

  return (
    <View className={containerClassName}>
      <Text className={labelClassName}>
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <View>
        <TextInput
          secureTextEntry={secureTextEntry}
          className={`relative ${finalInputClassName}`}
          {...props}
        />

        {hasPasswordToggle && (
          <TouchableOpacity
            onPress={onTogglePassword}
            className="absolute right-4 top-0 bottom-0 justify-center"
          >
            <Ionicons
              name={secureTextEntry ? "eye" : "eye-off"}
              size={22}
              color={ThemeColors.secondary.main}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default FormField;
