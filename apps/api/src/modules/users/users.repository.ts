import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.repo.findOne({ where: { clerkId } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async save(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.repo.delete({ clerkId });
  }
}
