import { Field, InputType } from '@nestjs/graphql';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { CreatePhotoDto } from '@/file/dto/create-photo.dto';

import { BaseReviewDto } from './base-review.dto';

export class UpdateReviewDto extends PartialType(BaseReviewDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhotoDto)
  photos?: CreatePhotoDto[];
}

@InputType()
export class UpdateReviewGQLDto {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  placeId: string;

  @Field({ nullable: true })
  placeType: string;

  @Field(() => [CreatePhotoDto], { nullable: true })
  photos?: CreatePhotoDto[];
}
