import { v } from "convex/values";
import { defineTable } from "convex/server";

export const users = defineTable({
  externalId: v.string(),
  username: v.string(),
  email: v.string(),
  imageUrl: v.optional(v.string()),

  // Push notification fields
  pushToken: v.optional(v.string()),
  notificationsEnabled: v.optional(v.boolean()),

  updatedAt: v.optional(v.number()),
})
  .index("by_external_id", ["externalId"])
  .index("by_username", ["username"])
  .index("by_email", ["email"]);

