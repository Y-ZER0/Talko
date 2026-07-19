import { Controller, Get, Patch, Body, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "./user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get("search")
  async searchUsers(
    @CurrentUser() user: User,
    @Query("q") query: string,
  ) {
    const users = await this.usersService.searchByUsername(query, user.id);
    return users.map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
    }));
  }

  @Patch("me")
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
