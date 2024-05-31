import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { GraphQLCurrentUser } from '@/auth/CurrentUser.decorator';
import { GqlAuthGuard } from '@/auth/utils/gqlAuthGuard.strategy';
import { IUpload } from '@/file/dto/upload.interface';
import { FileUploadService } from '@/file/file.service';
import { CreateReviewDto } from '@/review/dto/create-review.dto';
import { UpdateReviewGQLDto } from '@/review/dto/update-review.dto';
import { HttpExceptionFilter } from '@/utils/allExceptions.filter';

import { ReviewService } from './review.service';
import { Review } from './schema/review.schema';

@Resolver()
@UseFilters(HttpExceptionFilter)
export class ReviewResolver {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly fileUploadService: FileUploadService
  ) {}

  @Query(() => [Review], {
    description: 'Get all reviews',
  })
  async getAllReviews(): Promise<Review[]> {
    return this.reviewService.findAll();
  }

  @Query(() => Review, {
    description: 'Get review by id',
  })
  @UseGuards(GqlAuthGuard)
  async getOneReview(
    @Args('id', { type: () => ID })
    id: string
  ): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @Mutation(() => Review, { description: 'Create review' })
  @UseGuards(GqlAuthGuard)
  async createReview(
    @Args('input') input: CreateReviewDto,
    @GraphQLCurrentUser() currentUser,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files?: [IUpload]
  ) {
    if (!files) {
      return this.reviewService.create([], input, currentUser._id);
    }

    const uploadedFiles = await this.fileUploadService.graphqlFileTransform(
      await Promise.all(files)
    );
    return this.reviewService.create(uploadedFiles, input, currentUser._id);
  }

  @Mutation(() => Review, { description: 'Update review' })
  @UseGuards(GqlAuthGuard)
  async updateReview(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateReviewGQLDto,
    @GraphQLCurrentUser() currentUser,
    @Args({ name: 'files', type: () => [GraphQLUpload], nullable: true }) files?: [IUpload]
  ): Promise<Review> {
    if (!files) {
      return this.reviewService.update(id, [], input, currentUser._id);
    }

    const uploadedFiles = await this.fileUploadService.graphqlFileTransform(
      await Promise.all(files)
    );

    return this.reviewService.update(id, uploadedFiles, input, currentUser._id);
  }

  @Mutation(() => Review, { description: 'Delete review' })
  @UseGuards(GqlAuthGuard)
  async deleteReview(
    @Args('id', { type: () => ID }) id: string,
    @GraphQLCurrentUser() currentUser
  ): Promise<Review | null> {
    return this.reviewService.remove(id, currentUser._id);
  }
}
