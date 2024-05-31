import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';

import { CreatePhotoDto } from '@/file/dto/create-photo.dto';

import { BaseAttractionDto } from './base-attraction.dto';

export class UpdateAttractionDto extends PartialType(BaseAttractionDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhotoDto)
  photos?: CreatePhotoDto[];
}
