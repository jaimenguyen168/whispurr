import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, getUserParticipants } from "../utils";

export const getConversationsForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const [blockedByMe, blockedMe] = await Promise.all([
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocker", (q) => q.eq("blockerId", user._id))
        .collect(),
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocked", (q) => q.eq("blockedUserId", user._id))
        .collect(),
    ]);

    const blockedIds = new Set([
      ...blockedByMe.map((b) => b.blockedUserId),
      ...blockedMe.map((b) => b.blockerId),
    ]);

    const userParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("leftAt", undefined),
      )
      .filter((q) => q.neq(q.field("isHidden"), true))
      .collect();

    const conversationsWithDetails = await Promise.all(
      userParticipants.map(async (participant) => {
        const conversation = await ctx.db.get(participant.conversationId);
        if (!conversation) return null;

        // Check if conversation has any messages
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participant.conversationId),
          )
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .collect()
          .then((messages) => messages.length);

        // Skip conversations with no messages
        if (messageCount === 0) return null;

        const allParticipants = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participant.conversationId),
          )
          .collect();

        // Hide conversations with blocked users
        const otherParticipant = allParticipants.find((p) => p.userId !== user._id);
        if (otherParticipant && blockedIds.has(otherParticipant.userId)) return null;

        const activeParticipants = allParticipants.filter((p) => !p.leftAt);
        const participantIds = activeParticipants.map((p) => p.userId);

        return {
          ...conversation,
          participantIds,
          allParticipants,
          activeParticipants,
          userParticipant: participant,
        };
      }),
    );

    return conversationsWithDetails
      .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
      .sort((a, b) => {
        const aPinned = a.userParticipant.pinnedAt ?? 0;
        const bPinned = b.userParticipant.pinnedAt ?? 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        return (b.lastMessageAt || 0) - (a.lastMessageAt || 0);
      });
  },
});

export const getConversationById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${args.conversationId} not found`);
    }

    // Use helper function
    const userParticipant = await getUserParticipants(
      ctx,
      args.conversationId,
      user._id,
    );

    const allParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const activeParticipants = allParticipants.filter((p) => !p.leftAt);
    const participantIds = activeParticipants.map((p) => p.userId);

    return {
      ...conversation,
      participantIds,
      allParticipants,
      activeParticipants,
      userParticipant,
    };
  },
});

export const createConversation = mutation({
  args: {
    receiverId: v.id("users"),
  },
  handler: async (ctx, { receiverId }) => {
    const sender = await getAuthenticatedUser(ctx);

    // Check if conversation already exists
    const senderParticipations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", sender._id).eq("leftAt", undefined),
      )
      .collect();

    for (const participation of senderParticipations) {
      const receiverParticipant = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation_and_user", (q) =>
          q
            .eq("conversationId", participation.conversationId)
            .eq("userId", receiverId),
        )
        .filter((q) => q.eq(q.field("leftAt"), undefined))
        .first();

      if (receiverParticipant) {
        if (participation.isHidden) {
          await ctx.db.patch(participation._id, {
            isHidden: false,
          });
        }
        return participation.conversationId;
      }
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      updatedAt: Date.now(),
    });

    // Add sender to conversation participants
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: sender._id,
      joinedAt: Date.now(),
    });

    // Add receiver to conversation participants
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: receiverId,
      joinedAt: Date.now(),
    });

    return conversationId;
  },
});

export const pinConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const userParticipant = await getUserParticipants(ctx, args.conversationId, user._id);

    // Unpin any currently pinned conversation first
    const allParticipations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_active", (q) => q.eq("userId", user._id).eq("leftAt", undefined))
      .collect();

    for (const p of allParticipations) {
      if (p.pinnedAt && p._id !== userParticipant._id) {
        await ctx.db.patch(p._id, { pinnedAt: undefined });
      }
    }

    // Toggle: unpin if already pinned, otherwise pin
    const isAlreadyPinned = !!userParticipant.pinnedAt;
    await ctx.db.patch(userParticipant._id, {
      pinnedAt: isAlreadyPinned ? undefined : Date.now(),
    });

    return { pinned: !isAlreadyPinned };
  },
});

export const hideConversationForAll = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    const participants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, { isHidden: true });
    }
  },
});

export const hideConversationForUser = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Use helper function
    const userParticipant = await getUserParticipants(
      ctx,
      args.conversationId,
      user._id,
    );

    await ctx.db.patch(userParticipant._id, {
      isHidden: true,
    });

    return { success: true, action: "hidden" };
  },
});

export const leaveConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Use helper function
    const userParticipant = await getUserParticipants(
      ctx,
      args.conversationId,
      user._id,
    );

    // Mark user as having left
    await ctx.db.patch(userParticipant._id, {
      leftAt: Date.now(),
    });

    // Check if this was a 1-on-1 conversation and if other user also left
    const allParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    const originalParticipants = allParticipants.filter(
      (p) => !p.leftAt || p._id === userParticipant._id,
    );
    const stillActiveParticipants = allParticipants.filter(
      (p) => !p.leftAt && p._id !== userParticipant._id,
    );

    // If no one is left, clean up
    if (
      originalParticipants.length === 2 &&
      stillActiveParticipants.length === 0
    ) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId),
        )
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      for (const participant of allParticipants) {
        await ctx.db.delete(participant._id);
      }

      await ctx.db.delete(args.conversationId);

      return { success: true, action: "deleted" };
    }

    return { success: true, action: "left" };
  },
});

export const rejoinConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const userParticipant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", user._id),
      )
      .first();

    if (!userParticipant) {
      throw new Error("User was never a participant in this conversation");
    }

    if (!userParticipant.leftAt) {
      if (userParticipant.isHidden) {
        await ctx.db.patch(userParticipant._id, {
          isHidden: false,
        });
      }
      return { success: true, action: "unhidden" };
    }

    await ctx.db.patch(userParticipant._id, {
      leftAt: undefined,
      isHidden: false,
      joinedAt: Date.now(), // Update join time
    });

    return { success: true, action: "rejoined" };
  },
});

export const unhideConversationOnMessage = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const activeParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    for (const participant of activeParticipants) {
      if (participant.isHidden) {
        await ctx.db.patch(participant._id, {
          isHidden: false,
        });
      }
    }

    return { success: true };
  },
});

export const updateLastSeenAt = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Use helper function
    const userParticipant = await getUserParticipants(
      ctx,
      args.conversationId,
      user._id,
    );

    await ctx.db.patch(userParticipant._id, {
      lastSeenAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Shared conversation encryption key.
 *
 * First caller provides a newly-generated key; subsequent callers (on any
 * device, any user in the conversation) receive the same stored key.
 * The key is a random 64-char hex string (256 bits) generated on the client.
 */
export const getOrSetConversationKey = mutation({
  args: {
    conversationId: v.id("conversations"),
    proposedKey: v.string(), // ignored if a key already exists
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx); // ensure caller is authenticated

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.lastMessageEncryptionKey) {
      return conversation.lastMessageEncryptionKey;
    }

    // First time — store the proposed key
    await ctx.db.patch(args.conversationId, {
      lastMessageEncryptionKey: args.proposedKey,
    });
    return args.proposedKey;
  },
});
