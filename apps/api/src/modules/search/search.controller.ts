import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/user.entity";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @CurrentUser() user: User,
    @Query("q") query: string,
  ) {
    return this.searchService.search(query ?? "", user.id);
  }
}
