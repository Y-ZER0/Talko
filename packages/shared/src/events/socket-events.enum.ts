export enum SocketEvent {
  // Message
  MESSAGE_NEW = "message:new",
  MESSAGE_ACK = "message:ack",
  MESSAGE_EDIT = "message:edit",
  MESSAGE_DELETE = "message:delete",

  // Typing
  TYPING_START = "typing:start",
  TYPING_STOP = "typing:stop",

  // Reaction
  REACTION_ADD = "reaction:add",
  REACTION_REMOVE = "reaction:remove",

  // Receipt
  RECEIPT_READ = "receipt:read",
  RECEIPT_UPDATE = "receipt:update",

  // Conversation
  CONVERSATION_JOIN = "conversation:join",
  CONVERSATION_LEAVE = "conversation:leave",
  CONVERSATION_NEW = "conversation:new",

  // Presence
  PRESENCE_UPDATE = "presence:update",

  // System
  ERROR = "error",
}
