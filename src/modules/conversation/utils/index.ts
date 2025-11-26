import * as Crypto from "expo-crypto";
import AES from "react-native-aes-crypto";

// Get conversation key - simplified to use just conversation ID
export const getConversationKey = async (
  conversationId: string,
): Promise<string> => {
  // Use conversation ID to generate a consistent key

  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    conversationId,
  );
};

// Your current encryption function would store IV in encryptionKey
export const encryptMessage = async (
  message: string,
  conversationId: string,
) => {
  const sharedKey = await getConversationKey(conversationId);
  const iv = await Crypto.getRandomBytesAsync(16);
  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const encrypted = await AES.encrypt(message, sharedKey, ivHex, "aes-256-cbc");

  return {
    encryptedContent: encrypted,
    encryptionKey: ivHex, // Store IV in encryptionKey field
  };
};

// Decrypt using encryptionKey as IV
export const decryptMessage = async (
  encryptedContent: string,
  conversationId: string,
  encryptionKey: string,
) => {
  const sharedKey = await getConversationKey(conversationId);
  return await AES.decrypt(
    encryptedContent,
    sharedKey,
    encryptionKey,
    "aes-256-cbc",
  );
};
