import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export enum PhotoType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
  USER = 'User',
  REVIEW = 'Review',
}

export type PhotoDocument = mongoose.HydratedDocument<Photo>;

registerEnumType(PhotoType, {
  name: 'PhotoType',
  description: 'Type of photo',
});

@ObjectType()
@Schema()
export class Photo {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, default: '' })
  imageAlt: string;

  @Field()
  @Prop({ required: true, default: '' })
  imageUrl: string;

  @Field(() => PhotoType)
  @Prop({ required: true, enum: PhotoType, default: PhotoType.USER })
  imageType: PhotoType;

  @Field(() => ID)
  @Prop({ required: true, type: mongoose.Types.ObjectId })
  uploadUserId: string;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
