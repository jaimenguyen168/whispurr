"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { createHash, createDecipheriv } from "crypto";

export const decryptMessageAction = action({
  args: {
    encryptedContent: v.string(),
    conversationId: v.string(),
    encryptionKey: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const sharedKey = createHash("sha256")
        .update(args.conversationId)
        .digest("hex");
      const iv = Buffer.from(args.encryptionKey, "hex");

      const decipher = createDecipheriv(
        "aes-256-cbc",
        Buffer.from(sharedKey, "hex"),
        iv,
      );
      let decrypted = decipher.update(args.encryptedContent, "base64", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Backend decryption failed:", error);
      return "New message";
    }
  },
});
