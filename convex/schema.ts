import { defineSchema } from "convex/server";
import { users } from "./schema/users";
import { conversations, messages } from "./schema/conversations";

export default defineSchema({
  users: users,

  conversations: conversations,
  messages: messages,
});
