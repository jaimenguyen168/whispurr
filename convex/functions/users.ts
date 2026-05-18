import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, getImageUrl } from "../utils";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await getImageUrl(ctx, currentUser.imageUrl);

    return {
      ...currentUser,
      imageUrl,
      notificationsEnabled: currentUser.notificationsEnabled ?? true, // Default to true
    };
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

    const imageUrl = await getImageUrl(ctx, user.imageUrl);

    return {
      ...user,
      imageUrl,
      notificationsEnabled: user.notificationsEnabled ?? true, // Default to true
    };
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const [blockedByMe, blockedMe] = await Promise.all([
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
        .collect(),
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocked", (q) => q.eq("blockedUserId", currentUser._id))
        .collect(),
    ]);

    const blockedIds = new Set([
      ...blockedByMe.map((b) => b.blockedUserId),
      ...blockedMe.map((b) => b.blockerId),
    ]);

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser._id))
      .collect();

    return await Promise.all(
      users
        .filter((u) => !blockedIds.has(u._id))
        .map(async (user) => {
          const imageUrl = await getImageUrl(ctx, user.imageUrl);
          return {
            ...user,
            imageUrl,
            notificationsEnabled: user.notificationsEnabled ?? true,
          };
        }),
    );
  },
});

export const searchUsersByEmail = query({
  args: { emailQuery: v.string() },
  handler: async (ctx, args) => {
    if (!args.emailQuery.trim()) return [];

    const currentUser = await getAuthenticatedUser(ctx);

    const [blockedByMe, blockedMe] = await Promise.all([
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocker", (q) => q.eq("blockerId", currentUser._id))
        .collect(),
      ctx.db
        .query("blockedUsers")
        .withIndex("by_blocked", (q) => q.eq("blockedUserId", currentUser._id))
        .collect(),
    ]);

    const blockedIds = new Set([
      ...blockedByMe.map((b) => b.blockedUserId),
      ...blockedMe.map((b) => b.blockerId),
    ]);

    const query = args.emailQuery.toLowerCase().trim();

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser._id))
      .collect();

    const matched = users.filter(
      (u) =>
        !blockedIds.has(u._id) &&
        (u.email.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query)),
    );

    return await Promise.all(
      matched.map(async (user) => {
        const imageUrl = await getImageUrl(ctx, user.imageUrl);
        return {
          ...user,
          imageUrl,
          notificationsEnabled: user.notificationsEnabled ?? true,
        };
      }),
    );
  },
});

export const getOtherUserByConversationId = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // Get ALL participants in this conversation (including those who left)
    const allParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    // Verify current user is a participant (and hasn't left)
    const currentUserParticipant = allParticipants.find(
      (p) => p.userId === currentUser._id && !p.leftAt,
    );
    if (!currentUserParticipant) {
      throw new Error("User is not an active participant in this conversation");
    }

    // Find the other user (regardless of whether they left)
    const otherUserParticipant = allParticipants.find(
      (p) => p.userId !== currentUser._id,
    );
    if (!otherUserParticipant) {
      throw new Error("No other user found in this conversation");
    }

    const otherUser = await ctx.db.get(otherUserParticipant.userId);
    if (!otherUser) {
      throw new Error("Other user not found");
    }

    const imageUrl = await getImageUrl(ctx, otherUser.imageUrl);

    return {
      ...otherUser,
      imageUrl,
      notificationsEnabled: otherUser.notificationsEnabled ?? true, // Default to true
      participantInfo: otherUserParticipant, // Include join/leave info
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const updateData: {
      username?: string;
      imageUrl?: string;
    } = {};

    if (args.username !== undefined) {
      // Check if username is already taken by another user
      const existingUser = await ctx.db
        .query("users")
        .filter((q) =>
          q.and(
            q.eq(q.field("username"), args.username),
            q.neq(q.field("_id"), user._id),
          ),
        )
        .first();

      if (existingUser) {
        throw new Error("Username is already taken");
      }

      updateData.username = args.username;
    }

    if (args.imageUrl !== undefined) {
      updateData.imageUrl = args.imageUrl;
    }

    await ctx.db.patch(user._id, updateData);

    return { success: true };
  },
});

export const updatePushToken = mutation({
  args: {
    pushToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      pushToken: args.pushToken,
    });

    return { success: true };
  },
});

export const updateNotificationPreference = mutation({
  args: {
    notificationsEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      notificationsEnabled: args.notificationsEnabled,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getUserPushToken = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.pushToken;
  },
});

export const getUserNotificationPreference = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.notificationsEnabled ?? true; // Default to true if not set
  },
});

export const getFriends = query({
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

    const participations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("leftAt", undefined),
      )
      .collect();

    const friends = await Promise.all(
      participations.map(async (participation) => {
        const otherParticipant = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId),
          )
          .filter((q) => q.neq(q.field("userId"), user._id))
          .first();

        if (!otherParticipant) return null;
        if (blockedIds.has(otherParticipant.userId)) return null;

        const friend = await ctx.db.get(otherParticipant.userId);
        if (!friend) return null;

        const imageUrl = await getImageUrl(ctx, friend.imageUrl);

        return {
          ...friend,
          imageUrl,
          conversationId: participation.conversationId,
        };
      }),
    );

    return friends.filter((f): f is NonNullable<typeof f> => f !== null);
  },
});

export const clearPushToken = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    await ctx.db.patch(user._id, {
      pushToken: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
