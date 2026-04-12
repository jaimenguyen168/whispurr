import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  generateAndStoreKeyPair,
  getStoredPrivateKey,
  encryptPrivateKeyWithPassword,
  decryptPrivateKeyWithPassword,
} from "@/src/modules/conversation/utils/crypto";
import { useAuth } from "@clerk/clerk-expo";
import { useKeyReady } from "@/src/providers/KeySetupProvider";

export const useKeySetup = () => {
  const { isSignedIn, userId } = useAuth();
  const { setIsKeyReady } = useKeyReady();
  const currentUser = useQuery(
    api.functions.users.getCurrentUser,
    isSignedIn ? undefined : "skip",
  );
  const initializeKeys = useMutation(api.functions.keys.initializeUserKeys);
  const getEncryptedKey = useQuery(
    api.functions.keys.getMyEncryptedPrivateKey,
    isSignedIn ? undefined : "skip",
  );

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const setup = async () => {
      if (!currentUser) {
        console.log("[KeySetup] Waiting for current user...");
        return;
      }

      // No more reset here — key is preserved across renders
      const backupPassword = userId;

      if (currentUser.publicKey) {
        const localKey = await getStoredPrivateKey(userId);

        if (localKey) {
          console.log("[KeySetup] ✅ Keys already set up on this device");
          console.log(
            "[KeySetup] Public key:",
            currentUser.publicKey.slice(0, 20) + "...",
          );
          console.log(
            "[KeySetup] Local private key:",
            localKey.slice(0, 20) + "...",
          );
          setIsKeyReady(true);
          return;
        }

        console.log(
          "[KeySetup] 🔄 New device detected, recovering keys from backup...",
        );
        if (!getEncryptedKey) {
          console.log("[KeySetup] ❌ No encrypted backup found in Convex");
          return;
        }

        const recovered = await decryptPrivateKeyWithPassword(
          getEncryptedKey.encryptedPrivateKey,
          backupPassword,
          getEncryptedKey.salt,
          getEncryptedKey.iv,
          userId,
        );

        console.log(
          "[KeySetup] ✅ Private key recovered:",
          recovered.slice(0, 20) + "...",
        );
        setIsKeyReady(true);
        return;
      }

      console.log("[KeySetup] 🔑 First time setup, generating keypair...");
      const { publicKeyHex, privateKeyHex } =
        await generateAndStoreKeyPair(userId);
      const { encryptedPrivateKey, salt, iv } =
        await encryptPrivateKeyWithPassword(privateKeyHex, backupPassword);

      await initializeKeys({
        publicKey: publicKeyHex,
        encryptedPrivateKey,
        salt,
        iv,
      });
      console.log("[KeySetup] ✅ Keys saved to Convex successfully");
      setIsKeyReady(true);
    };

    setup().catch((err) => console.error("[KeySetup] ❌ Setup failed:", err));
  }, [currentUser?._id, isSignedIn, userId]);
};
