import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { api } from "@/convex/_generated/api";
import { ConversationId } from "@/src/types/convex";

const localCacheKey = (conversationId: string) =>
  `shared_conv_key_${conversationId}`;

/**
 * useConversationKey
 *
 * Returns the shared AES-256 key for the given conversation.
 * On first call the hook generates a random key, writes it to Convex, and
 * caches it in SecureStore. All subsequent calls (on any device, any
 * participant) read the key that was stored in Convex.
 *
 * Returns null while loading.
 */
export function useConversationKey(
  conversationId: ConversationId | null | undefined,
): string | null {
  const [key, setKey] = useState<string | null>(null);
  const getOrSetKey = useMutation(
    api.functions.conversations.getOrSetConversationKey,
  );
  // Track which conversationId we've already fetched to avoid duplicate calls
  const fetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    if (fetchedFor.current === conversationId) return;

    let cancelled = false;

    const load = async () => {
      // 1. Check local SecureStore cache first (avoids a round-trip)
      const cached = await SecureStore.getItemAsync(
        localCacheKey(conversationId),
      );
      if (cached) {
        if (!cancelled) setKey(cached);
        fetchedFor.current = conversationId;
        return;
      }

      // 2. Generate a candidate key (used only if no key exists in Convex yet)
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const proposedKey = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 3. Fetch-or-create from Convex — winner-takes-all (first writer wins)
      const sharedKey = await getOrSetKey({ conversationId, proposedKey });

      if (!cancelled) {
        // Cache locally so future calls are instant
        await SecureStore.setItemAsync(localCacheKey(conversationId), sharedKey);
        setKey(sharedKey);
        fetchedFor.current = conversationId;
      }
    };

    load().catch((err) =>
      console.error("[useConversationKey] Failed to load key:", err),
    );

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return key;
}
