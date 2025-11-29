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
    };
  },
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser._id))
      .collect();

    return await Promise.all(
      users.map(async (user) => {
        const imageUrl = await getImageUrl(ctx, user.imageUrl);
        return {
          ...user,
          imageUrl,
        };
      }),
    );
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

    const otherUser = await ctx.db.get(otherUserId);
    if (!otherUser) {
      throw new Error("Other user not found");
    }

    const imageUrl = await getImageUrl(ctx, otherUser.imageUrl);

    return {
      ...otherUser,
      imageUrl,
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

export const getUserPushToken = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.pushToken;
  },
});
