import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

import { PhotoType } from '@/schema/photo.schema';

@InputType()
export class CreatePhotoDto {
  @Field()
  @IsString()
  imageAlt: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @Field(() => PhotoType)
  @IsEnum(PhotoType)
  imageType: PhotoType;

  @Field()
  @IsString()
  @IsNotEmpty()
  uploadUserId: string;
}
