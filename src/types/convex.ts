import { Doc, Id } from "@/convex/_generated/dataModel";

export type User = Doc<"users">;
export type Conversation = Doc<"conversations">;
export type Message = Doc<"messages">;

export type UserId = Id<"users">;
export type ConversationId = Id<"conversations">;
export type MessageId = Id<"messages">;
