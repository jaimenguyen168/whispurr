import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

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

    return messages ?? [];
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
    // First, unhide the conversation for all participants (in case it was "deleted")
    await ctx.runMutation(
      api.functions.conversations.unhideConversationOnMessage,
      {
        conversationId: args.conversationId,
      },
    );

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

    // Get active participants for this conversation
    const activeParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    // Find recipient(s) - exclude sender
    const recipients = activeParticipants.filter(
      (p) => p.userId !== args.senderId,
    );

    if (recipients.length > 0) {
      // Get sender info
      const sender = await ctx.db.get(args.senderId);

      if (sender) {
        // Send notifications to all recipients
        for (const recipientParticipant of recipients) {
          const recipient = await ctx.db.get(recipientParticipant.userId);

          if (recipient) {
            // Check if recipient has notifications enabled (default to true if not set)
            const notificationsEnabled = recipient.notificationsEnabled ?? true;

            // Only send notification if recipient has notifications enabled
            if (notificationsEnabled) {
              // Schedule push notification
              await ctx.scheduler.runAfter(
                0,
                api.functions.messages.sendMessageNotification,
                {
                  recipientId: recipientParticipant.userId,
                  senderName: sender.username || sender.email || "Someone",
                  messageContent: args.content, // Pass encrypted content
                  encryptionKey: args.encryptionKey, // Pass the encryption key
                  conversationId: args.conversationId,
                },
              );
            }
          }
        }
      }
    }

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
    messageContent: v.string(),
    encryptionKey: v.optional(v.string()),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args): Promise<NotificationResult> => {
    try {
      // Get recipient's push token and notification preference
      const recipient = await ctx.runQuery(api.functions.users.getUserById, {
        userId: args.recipientId,
      });

      if (!recipient?.pushToken) {
        console.log("No push token found for recipient");
        return { success: false, reason: "No push token" };
      }

      // Double-check notification preference (should already be checked in createMessage)
      if (!recipient.notificationsEnabled) {
        console.log("Notifications disabled for recipient");
        return { success: false, reason: "Notifications disabled" };
      }

      const decryptedContent = await ctx.runAction(
        api.lib.decryption.decryptMessageAction,
        {
          encryptedContent: args.messageContent,
          conversationId: args.conversationId,
          encryptionKey: args.encryptionKey || "",
        },
      );

      const notificationBody =
        decryptedContent.length > 50
          ? decryptedContent.substring(0, 47) + "..."
          : decryptedContent;

      // Send push notification
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
      console.log("Push notification sent:", result);
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
