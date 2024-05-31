import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';

@InputType()
class PeriodDto {
  @Field()
  @IsString()
  openTime: string;

  @Field()
  @IsString()
  closeTime: string;
}

@InputType()
export class CreateBusinessTimeDto {
  @Field()
  @IsBoolean()
  isOpenAllDay: boolean;

  @Field()
  @IsBoolean()
  isClosed: boolean;

  @Field(() => [PeriodDto])
  @IsArray()
  @ValidateNested()
  @Type(() => PeriodDto)
  period: PeriodDto[];
}
