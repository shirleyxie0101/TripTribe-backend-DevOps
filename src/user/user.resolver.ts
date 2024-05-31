import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { GraphQLCurrentUser } from '@/auth/CurrentUser.decorator';
import { GqlAuthGuard } from '@/auth/utils/gqlAuthGuard.strategy';
import { HttpExceptionFilter } from '@/utils/allExceptions.filter';

import { User } from './schema/user.schema';
import { UserService } from './user.service';

@Resolver()
@UseFilters(HttpExceptionFilter)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, {
    description: 'Get ME',
  })
  @UseGuards(GqlAuthGuard)
  getMe(@GraphQLCurrentUser() currentUser): User {
    return this.userService.getMe(currentUser);
  }

  @Query(() => User, {
    description: 'Get user by id',
  })
  @UseGuards(GqlAuthGuard)
  async getOneUser(
    @Args('id', { type: () => ID })
    id: string
  ): Promise<User> {
    return this.userService.findOne(id);
  }
}
