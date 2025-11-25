import { query } from "../_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const externalId = "12345678";

    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();

    if (!user) {
      throw new Error(`User with external ID ${externalId} not found`);
    }

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
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
    return await ctx.db
      .query("users")
      .withIndex("by_external_id")
      .filter((q) => q.neq(q.field("externalId"), "12345678"))
      .collect();
  },
});

export const getOtherUserByConversationId = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const externalId = "12345678";

    // Get the current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
      .first();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // Get the conversation
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error(`Conversation with ID ${args.conversationId} not found`);
    }

    // Check if the current user is part of the conversation
    if (!conversation.participantIds.includes(currentUser._id)) {
      throw new Error("User is not a participant in this conversation");
    }

    // Find the other user's ID (filter out current user's ID)
    const otherUserId = conversation.participantIds.find(
      (participantId) => participantId !== currentUser._id,
    );

    if (!otherUserId) {
      throw new Error("No other user found in this conversation");
    }

    // Get the other user's details
    const otherUser = await ctx.db.get(otherUserId);

    if (!otherUser) {
      throw new Error("Other user not found");
    }

    return otherUser;
  },
});
