import { Doc, Id } from "@/convex/_generated/dataModel";

export type User = Doc<"users">;
export type Conversation = Doc<"conversations">;

export type ConversationWithDetails = Conversation & {
  participantIds: Id<"users">[];
  allParticipants: Doc<"conversationParticipants">[];
  activeParticipants: Doc<"conversationParticipants">[];
  userParticipant: Doc<"conversationParticipants">;
};

export type Message = Doc<"messages">;

export type UserId = Id<"users">;
export type ConversationId = Id<"conversations">;
export type MessageId = Id<"messages">;

export interface ReplyToMessage {
  _id: MessageId;
  content: string;
  senderId: UserId;
  iv: string;
  _creationTime: number;
}

export interface MessageWithReply extends Message {
  replyTo?: ReplyToMessage;
}
