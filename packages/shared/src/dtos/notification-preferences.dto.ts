export interface NotificationPreferencesDto {
  directMessages: boolean;
  sound: boolean;
  mentionsOnly: boolean;
  doNotDisturb: boolean;
}

export type UpdateNotificationPreferencesRequest = Partial<NotificationPreferencesDto>;
