import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getMessagesForConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    encryptionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type,
      encryptionKey: args.encryptionKey,
      status: "sent",
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
      lastMessageBy: args.senderId,
      lastMessageEncryptionKey: args.encryptionKey,
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("sending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateMessageContent = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    encryptionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the message to check if it's the last message in its conversation
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Update the message
    await ctx.db.patch(args.messageId, {
      content: args.content,
      encryptionKey: args.encryptionKey,
      updatedAt: Date.now(),
    });

    // Check if this is the last message in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return { success: true };

    // Get the most recent message to see if we need to update the conversation's last message
    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", message.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();

    // If this is the last message, update the conversation
    if (lastMessage && lastMessage._id === args.messageId) {
      await ctx.db.patch(message.conversationId, {
        lastMessage: args.content,
        lastMessageEncryptionKey: args.encryptionKey,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    deletedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the message before deleting
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Soft delete the message
    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      deletedBy: args.deletedBy,
      updatedAt: Date.now(),
    });

    // Check if this was the last message in the conversation
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return { success: true };

    // If this was the last message, find the new last message
    const newLastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", message.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();

    // Update conversation with new last message info
    if (newLastMessage) {
      await ctx.db.patch(message.conversationId, {
        lastMessage: newLastMessage.content,
        lastMessageAt: newLastMessage.updatedAt,
        lastMessageBy: newLastMessage.senderId,
        lastMessageEncryptionKey: newLastMessage.encryptionKey,
        updatedAt: Date.now(),
      });
    } else {
      // No messages left, clear last message data
      await ctx.db.patch(message.conversationId, {
        lastMessage: undefined,
        lastMessageAt: undefined,
        lastMessageBy: undefined,
        lastMessageEncryptionKey: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
