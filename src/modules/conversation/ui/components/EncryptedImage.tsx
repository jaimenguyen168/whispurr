import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { decryptMessage } from "@/src/modules/conversation/utils/crypto";

interface EncryptedImageProps {
  url: string;
  iv: string;
  conversationKey: string;
  mimeType?: string;
  width: number;
  height: number;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

// Module-level cache: encrypted URL → decrypted data URI
const decryptedCache = new Map<string, string>();

const EncryptedImage = ({
  url,
  iv,
  conversationKey,
  mimeType = "image/jpeg",
  width,
  height,
  contentFit = "cover",
}: EncryptedImageProps) => {
  const cacheKey = `${url}::${iv}`;
  const [dataUri, setDataUri] = useState<string | null>(
    decryptedCache.get(cacheKey) ?? null,
  );
  const [loading, setLoading] = useState(!decryptedCache.has(cacheKey));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (decryptedCache.has(cacheKey)) {
      setDataUri(decryptedCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const decrypt = async () => {
      try {
        // Fetch the encrypted ciphertext from Convex storage
        const response = await fetch(url);
        const encryptedContent = await response.text();

        // Decrypt to get original base64 image data
        const base64 = await decryptMessage(encryptedContent, conversationKey, iv);
        const uri = `data:${mimeType};base64,${base64}`;

        if (!cancelled) {
          decryptedCache.set(cacheKey, uri);
          setDataUri(uri);
        }
      } catch (error) {
        console.error("[EncryptedImage] Failed to decrypt image:", error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    decrypt();
    return () => { cancelled = true; };
  }, [cacheKey]);

  if (loading) {
    return (
      <View style={{ width, height, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.1)" }}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
      </View>
    );
  }

  if (failed || !dataUri) {
    return (
      <View style={{ width, height, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)", gap: 8 }}>
        <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.4)" />
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Unable to load image</Text>
      </View>
    );
  }

  return (
    <Image
      source={dataUri}
      style={{ width, height }}
      contentFit={contentFit}
    />
  );
};

export default EncryptedImage;
