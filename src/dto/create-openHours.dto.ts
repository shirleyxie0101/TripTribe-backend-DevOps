import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';

import { CreateBusinessTimeDto } from './create-businessTime.dto';

@InputType()
export class CreateOpenHoursDto {
  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Monday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Tuesday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Wednesday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Thursday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Friday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Saturday: CreateBusinessTimeDto;

  @Field(() => CreateBusinessTimeDto)
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBusinessTimeDto)
  Sunday: CreateBusinessTimeDto;
}
