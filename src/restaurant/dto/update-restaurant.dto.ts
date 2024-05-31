import { Field, InputType } from '@nestjs/graphql';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { CreateAddressDto } from '@/dto/create-address.dto';
import { CreateOpenHoursDto } from '@/dto/create-openHours.dto';
import { CreatePhotoDto } from '@/file/dto/create-photo.dto';

import { CreateRestaurantDto } from './create-restaurant.dto';
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhotoDto)
  @IsOptional()
  photos?: CreatePhotoDto[];
}

@InputType()
export class UpdateRestaurantGQLDto {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => CreateOpenHoursDto, { nullable: true })
  openHours?: CreateOpenHoursDto;

  @Field(() => CreateAddressDto, { nullable: true })
  address?: CreateAddressDto;

  @Field(() => [CreatePhotoDto], { nullable: true })
  photos?: CreatePhotoDto[];
}
