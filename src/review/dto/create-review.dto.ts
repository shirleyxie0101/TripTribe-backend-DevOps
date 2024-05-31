import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsMongoId } from 'class-validator';

import { BaseReviewDto } from './base-review.dto';

export enum PlaceType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
}

@InputType()
export class CreateReviewDto extends BaseReviewDto {
  @Field()
  @IsMongoId()
  placeId: string;

  @Field()
  @IsEnum(PlaceType)
  placeType: string;
}
