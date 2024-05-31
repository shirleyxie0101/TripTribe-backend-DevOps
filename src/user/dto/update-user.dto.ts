import { IsString, IsOptional, IsNotEmptyObject } from 'class-validator';

import { Photo } from '@/schema/photo.schema';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly nickname?: string;

  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsNotEmptyObject()
  readonly userAvatar?: Photo;
}
