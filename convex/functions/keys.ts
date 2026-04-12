import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "../utils";

// Called on first app launch — saves public key, stores encrypted private key blob
export const initializeUserKeys = mutation({
  args: {
    publicKey: v.string(),
    encryptedPrivateKey: v.string(),
    salt: v.string(),
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Save public key on the user record
    await ctx.db.patch(user._id, { publicKey: args.publicKey });

    // Check if key backup already exists
    const existing = await ctx.db
      .query("userKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        encryptedPrivateKey: args.encryptedPrivateKey,
        salt: args.salt,
        iv: args.iv,
      });
    } else {
      await ctx.db.insert("userKeys", {
        userId: user._id,
        encryptedPrivateKey: args.encryptedPrivateKey,
        salt: args.salt,
        iv: args.iv,
      });
    }
  },
});

// Fetch the encrypted private key blob (for restoring on a new device)
export const getMyEncryptedPrivateKey = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("userKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

// Get a specific user's public key (needed when creating a conversation)
export const getUserPublicKey = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.publicKey ?? null;
  },
});
