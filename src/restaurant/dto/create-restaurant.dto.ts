import { Field, InputType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CreateAddressDto } from '@/dto/create-address.dto';
import { CreateOpenHoursDto } from '@/dto/create-openHours.dto';

@InputType()
export class CreateRestaurantDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  website?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Field(() => CreateOpenHoursDto)
  @ValidateNested()
  @Type(() => CreateOpenHoursDto)
  @Transform(({ value }) => JSON.parse(JSON.stringify(value)))
  openHours: CreateOpenHoursDto;

  @Field(() => CreateAddressDto)
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @Transform(({ value }) => JSON.parse(JSON.stringify(value)))
  address: CreateAddressDto;
}
