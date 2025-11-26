import { v } from "convex/values";
import { defineTable } from "convex/server";

export const conversations = defineTable({
  participantIds: v.array(v.id("users")),
  lastMessage: v.optional(v.string()),
  lastMessageAt: v.optional(v.number()),
  lastMessageBy: v.optional(v.id("users")),
  lastMessageEncryptionKey: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_participant_ids", ["participantIds"])
  .index("by_last_message", ["lastMessageAt"])
  .index("by_updated_at", ["updatedAt"]);

export const messages = defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  encryptionKey: v.optional(v.string()),
  status: v.union(
    v.literal("sending"),
    v.literal("sent"),
    v.literal("delivered"),
    v.literal("read"),
  ),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id("users")),
})
  .index("by_conversation", ["conversationId"])
  .index("by_sender", ["senderId"]);
