"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvent = void 0;
var SocketEvent;
(function (SocketEvent) {
    // Message
    SocketEvent["MESSAGE_NEW"] = "message:new";
    SocketEvent["MESSAGE_ACK"] = "message:ack";
    SocketEvent["MESSAGE_EDIT"] = "message:edit";
    SocketEvent["MESSAGE_DELETE"] = "message:delete";
    // Typing
    SocketEvent["TYPING_START"] = "typing:start";
    SocketEvent["TYPING_STOP"] = "typing:stop";
    // Reaction
    SocketEvent["REACTION_ADD"] = "reaction:add";
    SocketEvent["REACTION_REMOVE"] = "reaction:remove";
    // Receipt
    SocketEvent["RECEIPT_READ"] = "receipt:read";
    SocketEvent["RECEIPT_UPDATE"] = "receipt:update";
    // Conversation
    SocketEvent["CONVERSATION_JOIN"] = "conversation:join";
    SocketEvent["CONVERSATION_LEAVE"] = "conversation:leave";
    SocketEvent["CONVERSATION_NEW"] = "conversation:new";
    // Presence
    SocketEvent["PRESENCE_UPDATE"] = "presence:update";
    // System
    SocketEvent["ERROR"] = "error";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
//# sourceMappingURL=socket-events.enum.js.map