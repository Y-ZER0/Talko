import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { User } from "./user.entity";
import { UsersRepository } from "./users.repository";

interface UpsertUserInput {
  id: string;
  username: string;
  imageUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findByClerkId(clerkId);
  }

  async upsert(input: UpsertUserInput): Promise<User> {
    const existing = await this.usersRepository.findByClerkId(input.id);

    if (existing) {
      if (input.username !== existing.username) {
        const resolved = await this.resolveUsername(input.username, existing.id);
        existing.username = resolved;
      }
      if (input.imageUrl !== undefined) {
        existing.avatarUrl = input.imageUrl || null;
      }
      return this.usersRepository.save(existing);
    }

    const resolved = await this.resolveUsername(input.username);

    return this.usersRepository.save({
      clerkId: input.id,
      username: resolved,
      avatarUrl: input.imageUrl ?? null,
    });
  }

  private async resolveUsername(username: string, excludeId?: string): Promise<string> {
    const duplicate = await this.usersRepository.findByUsername(username);
    if (!duplicate || (excludeId && duplicate.id === excludeId)) {
      return username;
    }
    let candidate = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
    while (true) {
      const exists = await this.usersRepository.findByUsername(candidate);
      if (!exists) return candidate;
      candidate = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  async removeByClerkId(clerkId: string): Promise<void> {
    await this.usersRepository.deleteByClerkId(clerkId);
  }

  async getReadReceiptsEnabled(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.readReceiptsEnabled;
  }

  async searchByUsername(query: string, currentUserId: string): Promise<User[]> {
    const sanitized = query.replace(/[^\w]/g, "").trim();
    if (!sanitized) return [];
    return this.usersRepository.searchByUsername(sanitized, currentUserId);
  }

  async updateProfile(
    userId: string,
    data: { username?: string; avatarUrl?: string; readReceiptsEnabled?: boolean },
  ): Promise<User> {
    const user = await this.findById(userId);

    if (data.username !== undefined) {
      const duplicate = await this.usersRepository.findByUsername(data.username);
      if (duplicate && duplicate.id !== userId) {
        throw new ConflictException("Username is already taken");
      }
      user.username = data.username;
    }

    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl || null;
    }

    if (data.readReceiptsEnabled !== undefined) {
      user.readReceiptsEnabled = data.readReceiptsEnabled;
    }

    return this.usersRepository.save(user);
  }
}
