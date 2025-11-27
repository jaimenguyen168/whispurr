import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "../utils";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error(`User with ID ${args.userId} not found`);
    }

    return user;
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser._id))
      .collect();
  },
});

export const getOtherUserByConversationId = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("User is not a participant in this conversation");
    }

    const otherUserId = conversation.participantIds.find(
      (id) => id !== currentUser._id,
    );

    if (!otherUserId) {
      throw new Error("No other user found in this conversation");
    }

    return await ctx.db.get(otherUserId);
  },
});
