import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "../utils";

export const getConversationsForUser = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_updated_at")
      .order("desc")
      .collect();

    return conversations.filter((conversation) =>
      conversation.participantIds.includes(user?._id),
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
    receiverId: v.id("users"),
  },
  handler: async (ctx, { receiverId }) => {
    const sender = await getAuthenticatedUser(ctx);

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(q.eq(q.field("participantIds"), [sender._id, receiverId])),
          q.and(q.eq(q.field("participantIds"), [receiverId, sender._id])),
        ),
      )
      .first();

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    return await ctx.db.insert("conversations", {
      participantIds: [sender._id, receiverId],
      updatedAt: Date.now(),
    });
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.conversationId);

    return { success: true };
  },
});
