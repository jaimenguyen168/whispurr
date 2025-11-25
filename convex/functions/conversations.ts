import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getConversationsForUser = query({
  args: { },
  handler: async (ctx, args) => {
    const externalId = "12345678"

    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("externalId"), externalId)).first();

    if (!user) {
      throw new Error("User not found");
    }

    const conversations = await ctx.db.query("conversations").collect();

    return conversations.filter((conversation) =>
      conversation.participants.includes(user?._id),
    );
  },
});

export const getConversationById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error(`Conversation with ID ${args.conversationId} not found`);
    }

    return conversation;
  },
});

export const createConversation = mutation({
  args: {
    sender: v.id("users"),
    receiver: v.id("users"),
  },
  handler: async (ctx, { sender, receiver }) => {
    // Check if conversation already exists between these users
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("participants"), [sender, receiver])),
          q.and(q.eq(q.field("participants"), [sender, receiver])),
        ),
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    return await ctx.db.insert("conversations", {
      participants: [sender, receiver],
      updatedAt: Date.now(),
    });
  },
});

// Delete a conversation
export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    // First delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Then delete the conversation
    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});
