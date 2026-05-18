import { defineSchema } from "convex/server";
import { users } from "./schema/users";
import {
  conversationParticipants,
  conversations,
  messages,
} from "./schema/conversations";
import { reports, blockedUsers } from "./schema/moderation";

export default defineSchema({
  users: users,

  conversations: conversations,
  conversationParticipants: conversationParticipants,
  messages: messages,

  reports: reports,
  blockedUsers: blockedUsers,
});
