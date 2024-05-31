import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Address, AddressSchema } from '@/schema/address.schema';
import { BusinessTime, BusinessTimeSchema } from '@/schema/businessTime.schema';
import { OpenHours } from '@/schema/openHour.schema';
import { Photo, PhotoSchema } from '@/schema/photo.schema';

export type RestaurantDocument = mongoose.HydratedDocument<Restaurant>;

export enum MealEnum {
  BREAKFAST = 'Breakfast',
  BRUNCH = 'Brunch',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}

export enum CuisineEnum {
  AUSTRALIAN = 'Australian',
  ASIAN = 'Asian',
  CAFE = 'Cafe',
  ITALIAN = 'Italian',
}

registerEnumType(MealEnum, {
  name: 'MealEnum',
  description: 'Type of Meal',
});

registerEnumType(CuisineEnum, {
  name: 'CuisineEnum',
  description: 'Type of Cuisine',
});

@Schema({ _id: false })
class TagsType {
  @Prop({ type: [String], enum: Object.values(MealEnum) })
  meals: MealEnum[];

  @Prop({ type: [String], enum: Object.values(CuisineEnum) })
  cuisines: CuisineEnum[];

  @Prop({ type: Number, default: 0 })
  cost: number;
}

@ObjectType()
@Schema({ timestamps: true })
export class Restaurant {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field({ nullable: true })
  @Prop()
  website?: string;

  @Field()
  @Prop({ required: true })
  email: string;

  @Field()
  @Prop({ required: true })
  phone: string;

  @Field(() => OpenHours)
  @Prop({
    _id: false,
    type: {
      Monday: BusinessTimeSchema,
      Tuesday: BusinessTimeSchema,
      Wednesday: BusinessTimeSchema,
      Thursday: BusinessTimeSchema,
      Friday: BusinessTimeSchema,
      Saturday: BusinessTimeSchema,
      Sunday: BusinessTimeSchema,
    },
    default: {},
  })
  openHours: {
    Monday: BusinessTime;
    Tuesday: BusinessTime;
    Wednesday: BusinessTime;
    Thursday: BusinessTime;
    Friday: BusinessTime;
    Saturday: BusinessTime;
    Sunday: BusinessTime;
  };

  @Field(() => Address)
  @Prop({ type: AddressSchema, default: {} })
  address: Address;

  @Field(() => Float, { nullable: true })
  @Prop()
  overAllRating?: number;

  @Field(() => [Photo])
  @Prop({ type: [PhotoSchema], default: [] })
  photos: Photo[];

  @Field(() => ID)
  @Prop({ required: true, type: mongoose.Types.ObjectId })
  createdUserId: mongoose.Types.ObjectId;

  @Field(() => GraphQLISODateTime)
  createdAt: string;

  @Field(() => GraphQLISODateTime)
  updatedAt: string;

  @Prop({ type: TagsType, default: {} })
  tags: TagsType;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

@ObjectType()
export class RestaurantFilterResult {
  @Field()
  total: number;

  @Field()
  skip: number;

  @Field()
  limit: number;

  @Field(() => [Restaurant])
  data: Restaurant[];
}
