import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetDataListInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  sort?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: 'page size', example: 10 })
  limit?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ description: 'items to be skipped ', example: 10, default: 0 })
  skip?: number;
}
