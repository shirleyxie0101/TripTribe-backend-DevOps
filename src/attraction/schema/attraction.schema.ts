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

export type AttractionDocument = mongoose.HydratedDocument<Attraction>;

export enum TypeEnum {
  SIGHT_AND_LANDMARKS = 'Sights & Landmarks',
  NATURE_AND_PARKS = 'Nature & Parks',
  MUSEUMS = 'Museums',
  FUN_AND_GAMES = 'Fun & Games',
  NIGHTLIFE = 'Nightlife',
}

export enum DurationEnum {
  UP_TO_ONE_HOUR = 'Up to 1 hour',
  ONE_TO_FOUR_HOURS = '1 to 4 hours',
  FOUR_HOURS_TO_ONE_DAY = '4 hours to 1 day',
}

registerEnumType(TypeEnum, {
  name: 'TypeEnum',
  description: 'Type of Type',
});

registerEnumType(DurationEnum, {
  name: 'DurationEnum',
  description: 'Type of Duration',
});

@Schema({ _id: false })
class TagsType {
  @Prop({ type: [String], enum: Object.values(TypeEnum) })
  types: TypeEnum[];

  @Prop({ type: [String], enum: Object.values(DurationEnum) })
  durations: DurationEnum[];

  @Prop({ type: Number, default: 0 })
  cost: number;
}

@ObjectType()
@Schema({ timestamps: true })
export class Attraction {
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
  website: string;

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
  overAllRating: number;

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

export const AttractionSchema = SchemaFactory.createForClass(Attraction);

@ObjectType()
export class AttractionFilterResult {
  @Field()
  total: number;

  @Field()
  skip: number;

  @Field()
  limit: number;

  @Field(() => [Attraction])
  data: Attraction[];
}
