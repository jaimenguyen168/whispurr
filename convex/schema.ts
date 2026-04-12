import { defineSchema } from "convex/server";
import { userKeys, users } from "./schema/users";
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

  userKeys: userKeys,
});
