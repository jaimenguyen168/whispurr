import { v } from "convex/values";
import { defineTable } from "convex/server";

export const users = defineTable({
  externalId: v.string(),
  username: v.string(),
  email: v.string(),
  imageUrl: v.optional(v.string()),
  pushToken: v.optional(v.string()),
  notificationsEnabled: v.optional(v.boolean()),
  // Add encryption backup fields
  encryptedMasterKey: v.optional(v.string()),
  keyDerivationSalt: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_external_id", ["externalId"])
  .index("by_username", ["username"])
  .index("by_email", ["email"]);
