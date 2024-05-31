import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

import { LocationDto } from '@/dto/create-address.dto';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';

import { CuisineEnum, MealEnum } from '../schema/restaurant.schema';

@InputType()
export class GetRestaurantListFiltersDto {
  @Field(() => [MealEnum], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  meals?: MealEnum[];

  @Field(() => [CuisineEnum], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  cuisines?: CuisineEnum[];

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  isOpenNow?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  currentTime?: Date;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  distance?: number;

  @Field(() => LocationDto, { nullable: true })
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;
}
@InputType()
export class GetRestaurantListInput extends GetDataListInput {
  @Field(() => GetRestaurantListFiltersDto, { nullable: true })
  @Type(() => GetRestaurantListFiltersDto)
  @IsOptional()
  filters?: GetRestaurantListFiltersDto;
}
