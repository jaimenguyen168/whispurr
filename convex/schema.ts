import { defineSchema } from "convex/server";
import { users } from "./schema/users";
import {
  conversationParticipants,
  conversations,
  messages,
} from "./schema/conversations";

export default defineSchema({
  users: users,

  conversations: conversations,
  conversationParticipants: conversationParticipants,
  messages: messages,
});
