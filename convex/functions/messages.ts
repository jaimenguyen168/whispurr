import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { getAuthenticatedUser } from "../utils";

export const getMessagesForConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        if (message.replyToMessageId) {
          const originalMessage = await ctx.db.get(message.replyToMessageId);

          if (originalMessage && !originalMessage.deletedAt) {
            return {
              ...message,
              replyTo: {
                _id: originalMessage._id,
                content: originalMessage.content,
                senderId: originalMessage.senderId,
                iv: originalMessage.iv,
                _creationTime: originalMessage._creationTime,
              },
            };
          }
        }
        return message;
      }),
    );
  },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    iv: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    replyToMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const sender = await getAuthenticatedUser(ctx);

    if (args.replyToMessageId) {
      const originalMessage = await ctx.db.get(args.replyToMessageId);
      if (!originalMessage) {
        throw new Error("Message to reply to not found");
      }
      if (originalMessage.conversationId !== args.conversationId) {
        throw new Error("Cannot reply to message from different conversation");
      }
      if (originalMessage.deletedAt) {
        throw new Error("Cannot reply to deleted message");
      }
    }

    await ctx.runMutation(
      api.functions.conversations.unhideConversationOnMessage,
      { conversationId: args.conversationId },
    );

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: sender._id,
      content: args.content,
      iv: args.iv,
      type: args.type,
      replyToMessageId: args.replyToMessageId,
      status: "sent",
      updatedAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
      lastMessageBy: sender._id,
      updatedAt: Date.now(),
    });

    const activeParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    const recipients = activeParticipants.filter(
      (p) => p.userId !== sender._id,
    );

    if (recipients.length > 0) {
      for (const recipientParticipant of recipients) {
        const recipient = await ctx.db.get(recipientParticipant.userId);

        if (recipient) {
          const notificationsEnabled = recipient.notificationsEnabled ?? true;

          if (notificationsEnabled) {
            await ctx.scheduler.runAfter(
              0,
              api.functions.messages.sendMessageNotification,
              {
                recipientId: recipientParticipant.userId,
                senderName: sender.username || sender.email || "Someone",
                conversationId: args.conversationId,
              },
            );
          }
        }
      }
    }

    return messageId;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      deletedBy: user._id,
      updatedAt: Date.now(),
    });

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return { success: true };

    const newLastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", message.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();

    if (newLastMessage) {
      await ctx.db.patch(message.conversationId, {
        lastMessage: newLastMessage.content,
        lastMessageAt: newLastMessage.updatedAt,
        lastMessageBy: newLastMessage.senderId,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(message.conversationId, {
        lastMessage: undefined,
        lastMessageAt: undefined,
        lastMessageBy: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
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
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.messageId, {
      content: args.content,
      iv: args.iv,
      updatedAt: Date.now(),
    });

    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) return { success: true };

    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", message.conversationId),
      )
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .first();

    if (lastMessage && lastMessage._id === args.messageId) {
      await ctx.db.patch(message.conversationId, {
        lastMessage: args.content,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

interface PushNotificationMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: {
    conversationId: string;
    type: string;
  };
  priority: string;
}

interface NotificationResult {
  success: boolean;
  result?: any;
  error?: string;
  reason?: string;
}

export const sendMessageNotification = action({
  args: {
    recipientId: v.id("users"),
    senderName: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args): Promise<NotificationResult> => {
    try {
      const recipient = await ctx.runQuery(api.functions.users.getUserById, {
        userId: args.recipientId,
      });

      if (!recipient?.pushToken) {
        return { success: false, reason: "No push token" };
      }

      if (!recipient.notificationsEnabled) {
        return { success: false, reason: "Notifications disabled" };
      }

      // Since messages are E2E encrypted, show a generic notification body
      const notificationBody = "New message";

      const message: PushNotificationMessage = {
        to: recipient.pushToken,
        sound: "default",
        title: args.senderName,
        body: notificationBody,
        data: {
          conversationId: args.conversationId,
          type: "message",
        },
        priority: "high",
      };

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const toggleMessageReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const currentReactions = message.reactions || [];

    const existingReactionIndex = currentReactions.findIndex(
      (reaction) =>
        reaction.userId === user._id && reaction.emoji === args.emoji,
    );

    let updatedReactions;
    const isRemoving = existingReactionIndex !== -1;

    if (isRemoving) {
      updatedReactions = currentReactions.filter(
        (_, index) => index !== existingReactionIndex,
      );
    } else {
      const reactionsWithoutUser = currentReactions.filter(
        (reaction) => reaction.userId !== user._id,
      );
      updatedReactions = [
        ...reactionsWithoutUser,
        { emoji: args.emoji, userId: user._id },
      ];
    }

    await ctx.db.patch(args.messageId, {
      reactions: updatedReactions,
      updatedAt: Date.now(),
    });

    if (!isRemoving && message.senderId !== user._id) {
      const messageSender = await ctx.db.get(message.senderId);

      if (messageSender && messageSender.notificationsEnabled !== false) {
        const reactionMessage = `${user.username || user.email || "Someone"} reacted ${args.emoji} to your message`;

        await ctx.scheduler.runAfter(
          0,
          api.functions.messages.sendMessageNotification,
          {
            recipientId: message.senderId,
            senderName: reactionMessage,
            conversationId: message.conversationId,
          },
        );
      }
    }

    return { success: true, removed: isRemoving };
  },
});
