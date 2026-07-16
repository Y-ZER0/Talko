```
* **Real-Time Bi-directional Messaging:** The heart of the app. This allows
users to send and receive text instantly without refreshing the page, typically
powered by WebSockets rather than standard HTTP polling.
```

```
* **User Authentication & Profiles:** Secure login using Clerk and basic
profile management so users can identify who they are talking to.
```

```
* **1-on-1 and Group Chats:** The ability to route messages to a single specific
user ID or broadcast them to an array of users within a defined "room" or
"channel."
```

```
* **Message Persistence:** Storing messages in a database (using PostgreSQL)
so conversation history is retained when a user logs out and logs back
in.
```

```
* **Connection & Presence State:** The system must track and broadcast who is
currently connected. This powers the basic "Online/Offline" indicators.
```

```
* **Typing Indicators:** Real-time visual feedback (`User is typing...`) that
prevents users from talking over one another.
```

```
* **Read Receipts:** Granular message status tracking (Sent, Delivered, Read).
This requires acknowledging message delivery back to the server.
```

```
* **Multimedia Support**: Sharing of images, videos, audio clips, voice notes,
and documents.
```

```
* **Push Notifications:** Reaching the user when the app is backgrounded or
closed
```

```
* **Message Interactions**: Ability to reply to specific messages, edit or
delete sent messages, and add emoji reactions.
```

```
* **Search and Filtering:** Indexing chat history to allow users to instantly
find past messages, links, or media files.
```

```
* **Security & Privacy:** Implementing End-to-End Encryption (E2EE) using
protocols like Signal, or adding moderation tools (blocking, reporting) for
public channels.
```
