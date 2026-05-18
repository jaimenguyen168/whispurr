import { v } from "convex/values";
import { defineTable } from "convex/server";

export const reports = defineTable({
  reporterId: v.id("users"),
  reportedUserId: v.id("users"),
  conversationId: v.id("conversations"),
  reason: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("reviewed"),
    v.literal("dismissed"),
  ),
  createdAt: v.number(),
})
  .index("by_reporter", ["reporterId"])
  .index("by_reported", ["reportedUserId"])
  .index("by_conversation", ["conversationId"])
  .index("by_reporter_and_reported", ["reporterId", "reportedUserId"]);

export const blockedUsers = defineTable({
  blockerId: v.id("users"),
  blockedUserId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_blocker", ["blockerId"])
  .index("by_blocked", ["blockedUserId"])
  .index("by_blocker_and_blocked", ["blockerId", "blockedUserId"]);
