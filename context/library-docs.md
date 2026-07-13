# library-docs.md

Integration patterns for every external dependency this project touches. These are the patterns to follow — do not improvise a different shape mid-feature.

## Socket.io (NestJS Gateway)

```typescript
// modules/realtime/gateways/chat.gateway.ts
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(socket: Socket) {
    const userId = await this.verifyClerkToken(socket.handshake.auth.token); // reject if invalid
    socket.data.userId = userId;
    await this.presenceService.setOnline(userId, socket.id);
    socket.broadcast.emit("presence:update", { userId, status: "online" });
  }

  async handleDisconnect(socket: Socket) {
    const stillOnline = await this.presenceService.setOffline(
      socket.data.userId,
      socket.id,
    );
    if (!stillOnline)
      socket.broadcast.emit("presence:update", {
        userId: socket.data.userId,
        status: "offline",
      });
  }

  @SubscribeMessage("conversation:join")
  handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { conversationId }: { conversationId: string },
  ) {
    socket.join(conversationId); // room name === conversation_id, always
  }

  @SubscribeMessage("message:new")
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: SendMessageEventPayload,
  ) {
    const message = await this.messagesService.create(
      socket.data.userId,
      payload,
    ); // same service REST uses
    socket.emit("message:ack", { clientId: payload.clientId, message });
    this.server.to(payload.conversationId).emit("message:new", message);
  }
}
```

Never write business logic inline in a `@SubscribeMessage` handler — it must be a one-line delegate to a service method, identical to the reference plan's controller rule.

## Clerk — Backend (NestJS)

```typescript
// modules/auth/guards/clerk-auth.guard.ts
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace("Bearer ", "");
    const claims = await clerkClient.verifyToken(token); // throws on invalid/expired
    req.user = { clerkId: claims.sub };
    return true;
  }
}
```

Webhook sync (`user.created`, `user.updated`) — this is the correct place to upsert the local `users` row, not lazy-upsert on first request, to avoid a race between "socket connects" and "REST call creates user."

## Clerk — Frontend (Next.js)

```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

```typescript
// features/auth/hooks/useCurrentUser.ts — the ONLY place Clerk's useUser() is called directly
export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  return { user, isLoaded };
}
```

## Redis (`ioredis`) — Presence

```typescript
// modules/presence/services/presence.service.ts
const HEARTBEAT_TTL_SECONDS = 30;

async setOnline(userId: string, socketId: string) {
  await this.redis.sadd(`user:${userId}:sockets`, socketId);
  await this.redis.set(`user:${userId}:status`, 'online', 'EX', HEARTBEAT_TTL_SECONDS);
}

async setOffline(userId: string, socketId: string): Promise<boolean> {
  await this.redis.srem(`user:${userId}:sockets`, socketId);
  const remaining = await this.redis.scard(`user:${userId}:sockets`);
  if (remaining === 0) await this.redis.del(`user:${userId}:status`);
  return remaining > 0;
}
```

Typing keys are TTL-only, never read back for history: `SET conv:{id}:typing:{userId} 1 EX 5` on `typing:start`; `typing:stop` just deletes the key early.

## Multer + ImageKit

Multer's job stops at receiving the multipart upload into memory/disk; **ImageKit is the actual storage + image-processing layer** — don't build a separate resize/thumbnail pipeline, ImageKit already does this via URL-based transformations, and reimplementing it server-side would be duplicate, slower, and uncached.

```typescript
// modules/media/services/media.service.ts
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: config.get("IMAGEKIT_PUBLIC_KEY"),
  privateKey: config.get("IMAGEKIT_PRIVATE_KEY"),
  urlEndpoint: config.get("IMAGEKIT_URL_ENDPOINT"),
});

@Injectable()
export class MediaService {
  async uploadToImageKit(file: Express.Multer.File, folder: string) {
    const result = await imagekit.upload({
      file: file.buffer, // Multer memoryStorage, not diskStorage — avoids a temp-file cleanup step
      fileName: file.originalname,
      folder, // e.g. `/conversations/{conversationId}`
      useUniqueFileName: true,
    });
    return {
      url: result.url,
      fileId: result.fileId,
      mediaType: this.classify(file.mimetype),
    };
  }

  // Thumbnails are NOT pre-generated or stored separately — build them on demand from the base url.
  // ImageKit transformation params go in the URL itself, e.g.:
  //   `${baseUrl}?tr=w-300,h-300,fo-auto`   → 300x300 auto-cropped thumbnail
  //   `${baseUrl}?tr=w-1200`                → capped full-size render for the timeline
  buildTransformedUrl(baseUrl: string, transform: string): string {
    return `${baseUrl}?tr=${transform}`;
  }

  classify(mimetype: string): MessageMediaType {
    if (mimetype.startsWith("image/")) return MessageMediaType.IMAGE;
    if (mimetype.startsWith("audio/")) return MessageMediaType.AUDIO;
    if (mimetype.startsWith("video/")) return MessageMediaType.VIDEO;
    return MessageMediaType.DOCUMENT;
  }
}
```

```typescript
// modules/media/controllers/media.controller.ts
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: memoryStorage(),                          // buffer in memory, not disk — required for the ImageKit SDK call above
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: allowlistMimeTypes,                     // allowlist, not denylist
}))
async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: CurrentUserDto) {
  const { url, fileId, mediaType } = await this.mediaService.uploadToImageKit(file, `conversations/${conversationId}`);
  return { success: true, data: { url, fileId, mediaType } };
}
```

Consequence for the schema (`architecture.md` → `message_attachments`): store the **base ImageKit `url`** and `media_type` only. Do not add a separate `thumbnail_url` column for images — the frontend's `ImageAttachmentCard`/`SharedMediaGrid` call `buildTransformedUrl()` (or construct the `?tr=` query param directly) at render time. `thumbnail_url` on `message_attachments` is only actually used for non-image types where ImageKit transforms don't apply (e.g. a generated waveform preview image for a voice note, if you build one) — don't populate it for plain images, that's a stale, wasted column.

The upload endpoint returns a URL; the message referencing it is only emitted over the socket _after_ this REST call resolves (`architecture.md` Invariant 7).

## Firebase Cloud Messaging (FCM)

```typescript
// modules/notifications/services/fcm.service.ts
async notifyIfOffline(recipientId: string, conversationId: string, preview: string) {
  const isActiveInRoom = await this.presenceService.isInRoom(recipientId, conversationId);
  if (isActiveInRoom) return; // suppress — Invariant 9
  const tokens = await this.deviceTokensRepo.findByUser(recipientId);
  if (!tokens.length) return;
  await admin.messaging().sendEachForMulticast({
    tokens: tokens.map(t => t.fcmToken),
    notification: { title: 'New message', body: preview },
    data: { conversationId },
  });
}
```

## PostgreSQL Full-Text Search

```sql
-- migration
ALTER TABLE messages ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
CREATE INDEX messages_search_idx ON messages USING GIN (search_vector);
```

```typescript
// modules/search/services/search.service.ts
async search(userId: string, query: string) {
  return this.messagesRepo
    .createQueryBuilder('m')
    .innerJoin('conversation_members', 'cm', 'cm.conversation_id = m.conversation_id AND cm.user_id = :userId', { userId })
    .where(`m.search_vector @@ plainto_tsquery('english', :query)`, { query })
    .andWhere('m.is_deleted = false')
    .orderBy('ts_rank(m.search_vector, plainto_tsquery(:query))', 'DESC')
    .getMany();
}
```

Note the join on `conversation_members` — this is what prevents searching across conversations the user isn't a member of. Don't drop it for a "simpler" query.

## Intersection Observer (Read Receipts)

```typescript
// features/receipts/hooks/useMarkAsRead.ts
export function useMarkAsRead(conversationId: string) {
  const { socket } = useSocket();
  const pending = useRef<Set<string>>(new Set());
  const flush = useMemo(
    () =>
      debounce(() => {
        if (!pending.current.size) return;
        socket.emit("receipt:read", {
          conversationId,
          messageIds: [...pending.current],
        });
        pending.current.clear();
      }, 400),
    [socket, conversationId],
  );

  const observe = useCallback(
    (el: HTMLElement, messageId: string) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            pending.current.add(messageId);
            flush();
            observer.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    [flush],
  );

  return observe;
}
```

Batch, always — one socket emit per debounce window, never one per message.

## Typing Debounce (lodash)

```typescript
// features/messages/ui/MessageComposer.tsx (excerpt)
const emitTypingStop = useMemo(
  () => debounce(() => socket.emit("typing:stop", { conversationId }), 2000),
  [socket, conversationId],
);

function onChange(value: string) {
  setDraft(value);
  socket.emit("typing:start", { conversationId }); // fine to emit repeatedly, server treats it as a TTL refresh
  emitTypingStop();
}
```

Prefer `lodash.debounce` for this single case over pulling in RxJS — RxJS is justified only if a second stream-composition need shows up (e.g. combining typing + presence + reconnect logic); don't add the dependency for one debounce call.
