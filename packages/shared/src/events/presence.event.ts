export interface PresenceEventPayload {
  userId: string;
  status: "online" | "offline";
}
