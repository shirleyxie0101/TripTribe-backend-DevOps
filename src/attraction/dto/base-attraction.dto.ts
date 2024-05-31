import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CreateAddressDto } from '@/dto/create-address.dto';
import { CreateOpenHoursDto } from '@/dto/create-openHours.dto';

export class BaseAttractionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @ValidateNested()
  @Type(() => CreateOpenHoursDto)
  @Transform(({ value }) => JSON.parse(JSON.stringify(value)))
  openHours: CreateOpenHoursDto;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  @Transform(({ value }) => JSON.parse(JSON.stringify(value)))
  address: CreateAddressDto;
}
