import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

import { LocationDto } from '@/dto/create-address.dto';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';

import { DurationEnum, TypeEnum } from '../schema/attraction.schema';

@InputType()
export class GetAttractionListFiltersDto {
  @Field(() => [TypeEnum], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  types?: TypeEnum[];

  @Field(() => [DurationEnum], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  durations?: DurationEnum[];

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
export class GetAttractionListInput extends GetDataListInput {
  @Field(() => GetAttractionListFiltersDto, { nullable: true })
  @Type(() => GetAttractionListFiltersDto)
  @IsOptional()
  filters?: GetAttractionListFiltersDto;
}
