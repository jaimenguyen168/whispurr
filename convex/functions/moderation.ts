import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "../utils";

export const submitReport = mutation({
  args: {
    reportedUserId: v.id("users"),
    conversationId: v.id("conversations"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const reporter = await getAuthenticatedUser(ctx);

    // Prevent duplicate reports from the same user on the same target
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_reporter_and_reported", (q) =>
        q.eq("reporterId", reporter._id).eq("reportedUserId", args.reportedUserId),
      )
      .first();

    if (existing) return { alreadyReported: true };

    await ctx.db.insert("reports", {
      reporterId: reporter._id,
      reportedUserId: args.reportedUserId,
      conversationId: args.conversationId,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });

    return { alreadyReported: false };
  },
});

export const getReportStatus = query({
  args: { reportedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const reporter = await getAuthenticatedUser(ctx);

    const report = await ctx.db
      .query("reports")
      .withIndex("by_reporter_and_reported", (q) =>
        q.eq("reporterId", reporter._id).eq("reportedUserId", args.reportedUserId),
      )
      .first();

    return { hasReported: !!report };
  },
});

export const blockUser = mutation({
  args: { blockedUserId: v.id("users") },
  handler: async (ctx, args) => {
    const blocker = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", blocker._id).eq("blockedUserId", args.blockedUserId),
      )
      .first();

    if (existing) return;

    await ctx.db.insert("blockedUsers", {
      blockerId: blocker._id,
      blockedUserId: args.blockedUserId,
      createdAt: Date.now(),
    });
  },
});

export const getBlockStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const block = await ctx.db
      .query("blockedUsers")
      .withIndex("by_blocker_and_blocked", (q) =>
        q.eq("blockerId", currentUser._id).eq("blockedUserId", args.userId),
      )
      .first();

    return { isBlocked: !!block };
  },
});
