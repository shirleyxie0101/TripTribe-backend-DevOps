import { Field, Float, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
@InputType()
export class LocationDto {
  //lng must in front of lat
  @Field(() => Float)
  @IsNumber()
  lng: number;

  @Field(() => Float)
  @IsNumber()
  lat: number;
}

@InputType()
export class CreateAddressDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  formattedAddress: string;

  @Field(() => LocationDto)
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location: LocationDto;
}
