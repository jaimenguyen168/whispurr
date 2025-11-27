import { z } from "zod";

export const signupSchema = z
  .object({
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

enum ClerkErrorCodes {
  IDENTIFIER_NOT_FOUND = "form_identifier_not_found",
  PASSWORD_INCORRECT = "form_password_incorrect",
  TOO_MANY_REQUESTS = "too_many_requests",
  IDENTIFIER_EXISTS = "form_identifier_exists",
  INVALID_CREDENTIALS = "form_invalid_credentials",
  SESSION_EXISTS = "session_exists",
}

export const getClerkErrorMessage = (
  error: any,
  selectedTab: string,
): string => {
  if (!error?.errors || !Array.isArray(error.errors)) {
    return error?.message || "An unexpected error occurred. Please try again.";
  }

  const firstError = error.errors[0];

  switch (firstError?.code) {
    case ClerkErrorCodes.IDENTIFIER_NOT_FOUND:
      return `No account found with this ${selectedTab}. Please check your ${selectedTab} or register for a new account.`;

    case ClerkErrorCodes.PASSWORD_INCORRECT:
      return "Incorrect password. Please try again.";

    case ClerkErrorCodes.TOO_MANY_REQUESTS:
      return "Too many login attempts. Please wait a moment before trying again.";

    case ClerkErrorCodes.IDENTIFIER_EXISTS:
      return "This account already exists. Please try signing in.";

    case ClerkErrorCodes.INVALID_CREDENTIALS:
      return "Invalid credentials. Please check your information and try again.";

    case ClerkErrorCodes.SESSION_EXISTS:
      return "You are already signed in.";

    default:
      return firstError?.message || "Sign in failed. Please try again.";
  }
};
