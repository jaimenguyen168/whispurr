// src/modules/conversation/utils/crypto.ts
import * as Crypto from "expo-crypto";
import AES from "react-native-aes-crypto";

// ─── Message Encryption ───────────────────────────────────────────

/**
 * Encrypt a message using the shared conversation key.
 * The key is fetched from Convex via useConversationKey so it is identical
 * on every device — never derived per-device.
 */
export const encryptMessage = async (
  message: string,
  conversationKey: string,
): Promise<{ encryptedContent: string; iv: string }> => {
  const ivBytes = await Crypto.getRandomBytesAsync(16);
  const iv = bufferToHex(ivBytes);
  const encryptedContent = await AES.encrypt(
    message,
    conversationKey,
    iv,
    "aes-256-cbc",
  );

  return { encryptedContent, iv };
};

/**
 * Decrypt a message using the shared conversation key.
 * The key is fetched from Convex via useConversationKey so it is identical
 * on every device — never derived per-device.
 */
export const decryptMessage = async (
  encryptedContent: string,
  conversationKey: string,
  iv: string,
): Promise<string> => {
  return await AES.decrypt(encryptedContent, conversationKey, iv, "aes-256-cbc");
};

// ─── Internal helpers ─────────────────────────────────────────────

const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string =>
  Array.from(ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
