import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { PlaceType } from '@/common/constant/place-type';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { User } from '@/user/schema/user.schema';

import { Photo, PhotoSchema } from '../../schema/photo.schema';

export type ReviewDocument = mongoose.HydratedDocument<Review>;
@ObjectType()
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field()
  @Prop({ required: true })
  rating: number;

  @Field(() => [Photo])
  @Prop({ type: [PhotoSchema], default: [] })
  photos: Photo[];

  @Field(() => ID)
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'User' })
  userId: User;

  @Field(() => ID)
  @Prop({ required: true, type: mongoose.Types.ObjectId, refPath: 'placeType' })
  placeId: Attraction | Restaurant;

  @Field()
  @Prop({ required: true, enum: [PlaceType.Attraction, PlaceType.Restaurant] })
  placeType: PlaceType.Attraction | PlaceType.Restaurant;

  @Field(() => GraphQLISODateTime)
  createdAt: string;

  @Field(() => GraphQLISODateTime)
  updatedAt: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ placeType: 1, placeId: 1 });

ReviewSchema.virtual('creator', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
}).get((value) => {
  if (!value) return;
  return value[0];
});
