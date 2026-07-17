export interface PresenceEventPayload {
  userId: string;
  status: "online" | "offline";
  lastSeen?: string;
}
