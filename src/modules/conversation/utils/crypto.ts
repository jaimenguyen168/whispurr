// src/modules/conversation/utils/crypto.ts
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import AES from "react-native-aes-crypto";

const getPrivateKeyStoreKey = (userId: string) => `user_private_key_${userId}`;
const getConversationKeyPrefix = (userId: string) => `conv_key_${userId}_`;

// ─── Key Generation ───────────────────────────────────────────────

export const generateAndStoreKeyPair = async (
  userId: string,
): Promise<{
  publicKeyHex: string;
  privateKeyHex: string;
}> => {
  const privateKeyBytes = await Crypto.getRandomBytesAsync(32);
  const publicKeyBytes = await Crypto.getRandomBytesAsync(32);

  const privateKeyHex = bufferToHex(privateKeyBytes);
  const publicKeyHex = bufferToHex(publicKeyBytes);

  await SecureStore.setItemAsync(getPrivateKeyStoreKey(userId), privateKeyHex);

  return { publicKeyHex, privateKeyHex };
};

// ─── Private Key Backup (password-protected) ─────────────────────

export const encryptPrivateKeyWithPassword = async (
  privateKeyHex: string,
  password: string,
): Promise<{ encryptedPrivateKey: string; salt: string; iv: string }> => {
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const ivBytes = await Crypto.getRandomBytesAsync(16);
  const salt = bufferToHex(saltBytes);
  const iv = bufferToHex(ivBytes);

  const derivedKey = await deriveKeyFromPassword(password, salt);
  const encryptedPrivateKey = await AES.encrypt(
    privateKeyHex,
    derivedKey,
    iv,
    "aes-256-cbc",
  );

  return { encryptedPrivateKey, salt, iv };
};

export const decryptPrivateKeyWithPassword = async (
  encryptedPrivateKey: string,
  password: string,
  salt: string,
  iv: string,
  userId: string,
): Promise<string> => {
  const derivedKey = await deriveKeyFromPassword(password, salt);
  const privateKeyHex = await AES.decrypt(
    encryptedPrivateKey,
    derivedKey,
    iv,
    "aes-256-cbc",
  );

  await SecureStore.setItemAsync(getPrivateKeyStoreKey(userId), privateKeyHex);
  return privateKeyHex;
};

// ─── Conversation Key ─────────────────────────────────────────────

export const deriveConversationKey = async (
  privateKeyHex: string,
  conversationId: string,
): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    privateKeyHex + conversationId,
  );
};

export const getOrDeriveConversationKey = async (
  conversationId: string,
  userId: string,
): Promise<string | null> => {
  const cacheKey = getConversationKeyPrefix(userId) + conversationId;

  const cached = await SecureStore.getItemAsync(cacheKey);
  if (cached) {
    console.log(
      "[Crypto] Using cached conv key:",
      cached.slice(0, 20),
      "for:",
      conversationId,
    );
    return cached;
  }

  const privateKey = await SecureStore.getItemAsync(
    getPrivateKeyStoreKey(userId),
  );
  if (!privateKey) {
    console.log("[Crypto] No private key in SecureStore for user:", userId);
    return null;
  }

  const convKey = await deriveConversationKey(privateKey, conversationId);
  console.log(
    "[Crypto] Derived new conv key:",
    convKey.slice(0, 20),
    "for:",
    conversationId,
  );
  await SecureStore.setItemAsync(cacheKey, convKey);
  return convKey;
};

// ─── Message Encryption ───────────────────────────────────────────

export const encryptMessage = async (
  message: string,
  conversationId: string,
  userId: string,
): Promise<{ encryptedContent: string; iv: string }> => {
  const convKey = await getOrDeriveConversationKey(conversationId, userId);
  if (!convKey) throw new Error("No conversation key available");

  console.log(
    "[Crypto] Encrypting with key:",
    convKey.slice(0, 20),
    "length:",
    convKey.length,
  );

  const ivBytes = await Crypto.getRandomBytesAsync(16);
  const iv = bufferToHex(ivBytes);
  const encryptedContent = await AES.encrypt(
    message,
    convKey,
    iv,
    "aes-256-cbc",
  );

  return { encryptedContent, iv };
};

export const decryptMessage = async (
  encryptedContent: string,
  conversationId: string,
  iv: string,
  userId: string,
): Promise<string> => {
  const convKey = await getOrDeriveConversationKey(conversationId, userId);
  if (!convKey) throw new Error("No conversation key available");

  return await AES.decrypt(encryptedContent, convKey, iv, "aes-256-cbc");
};

// ─── SecureStore helpers ──────────────────────────────────────────

export const getStoredPrivateKey = async (
  userId: string,
): Promise<string | null> => {
  return await SecureStore.getItemAsync(getPrivateKeyStoreKey(userId));
};

// ─── Internal helpers ─────────────────────────────────────────────

const deriveKeyFromPassword = async (
  password: string,
  saltHex: string,
): Promise<string> => {
  let key = password + saltHex;
  for (let i = 0; i < 10000; i++) {
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key,
    );
  }
  return key;
};

const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string =>
  Array.from(ArrayBuffer.isView(buffer) ? buffer : new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
