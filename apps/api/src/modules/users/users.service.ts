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
        const duplicate = await this.usersRepository.findByUsername(input.username);
        if (duplicate && duplicate.id !== existing.id) {
          throw new ConflictException("Username is already taken");
        }
      }
      existing.username = input.username;
      if (input.imageUrl !== undefined) {
        existing.avatarUrl = input.imageUrl || null;
      }
      return this.usersRepository.save(existing);
    }

    const duplicate = await this.usersRepository.findByUsername(input.username);
    if (duplicate) {
      throw new ConflictException("Username is already taken");
    }

    return this.usersRepository.save({
      clerkId: input.id,
      username: input.username,
      avatarUrl: input.imageUrl ?? null,
    });
  }

  async removeByClerkId(clerkId: string): Promise<void> {
    await this.usersRepository.deleteByClerkId(clerkId);
  }

  async getReadReceiptsEnabled(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.readReceiptsEnabled;
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
