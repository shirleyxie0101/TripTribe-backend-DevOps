import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { GraphQLCurrentUser } from '@/auth/CurrentUser.decorator';
import { GqlAuthGuard } from '@/auth/utils/gqlAuthGuard.strategy';
import { IUpload } from '@/file/dto/upload.interface';
import { FileUploadService } from '@/file/file.service';
import { HttpExceptionFilter } from '@/utils/allExceptions.filter';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { GetRestaurantListInput } from './dto/filter-restaurant.dto';
import { UpdateRestaurantGQLDto } from './dto/update-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { Restaurant, RestaurantFilterResult } from './schema/restaurant.schema';

@Resolver(() => Restaurant)
@UseFilters(HttpExceptionFilter)
export class RestaurantResolver {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Query(() => RestaurantFilterResult, {
    description: 'Get all restaurants or get restaurants by filter',
  })
  async getAllRestaurants(
    @Args('input') input: GetRestaurantListInput
  ): Promise<RestaurantFilterResult> {
    return await this.restaurantService.findAll(input);
  }

  @Query(() => Restaurant, {
    description: 'Get restaurant by id',
  })
  async getOneRestaurant(
    @Args('id', { type: () => ID })
    id: string
  ): Promise<Restaurant> {
    return this.restaurantService.findOne(id);
  }

  @Mutation(() => Restaurant, { description: 'Create restaurant' })
  @UseGuards(GqlAuthGuard)
  async createRestaurant(
    @Args('input') input: CreateRestaurantDto,
    @GraphQLCurrentUser() currentUser,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files?: [IUpload]
  ) {
    if (!files) {
      return this.restaurantService.create(input, currentUser._id);
    }

    const uploadedFiles = await this.fileUploadService.graphqlFileTransform(
      await Promise.all(files)
    );
    return this.restaurantService.create(input, currentUser._id, uploadedFiles);
  }

  @Mutation(() => Restaurant, { description: 'Update restaurant' })
  @UseGuards(GqlAuthGuard)
  async updateRestaurant(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRestaurantGQLDto,
    @GraphQLCurrentUser() currentUser,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files?: [IUpload]
  ): Promise<Restaurant> {
    if (!files) {
      return this.restaurantService.update(id, input, currentUser._id);
    }

    const uploadedFiles = await this.fileUploadService.graphqlFileTransform(
      await Promise.all(files)
    );

    return this.restaurantService.update(id, input, currentUser._id, uploadedFiles);
  }

  @Mutation(() => Restaurant, { description: 'Delete restaurant' })
  @UseGuards(GqlAuthGuard)
  async deleteRestaurant(
    @Args('id', { type: () => ID }) id: string,
    @GraphQLCurrentUser() currentUser
  ): Promise<Restaurant> {
    return this.restaurantService.remove(id, currentUser._id);
  }
}
