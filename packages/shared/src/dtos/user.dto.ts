export interface UserDto {
  id: string;
  clerkId: string;
  username: string;
  avatarUrl: string | null;
  readReceiptsEnabled: boolean;
  createdAt: string;
}
