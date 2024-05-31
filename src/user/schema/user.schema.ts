import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hashSync } from 'bcryptjs';
import * as mongoose from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { PermissionGroup } from '@/permission-group/schema/permissionGroup.schema';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { Photo, PhotoSchema } from '@/schema/photo.schema';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS_OWNER = 'business_owner',
}

export type UserDocument = mongoose.HydratedDocument<User>;

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    select: false,
    //bcrypt secure password
    set(val) {
      return val ? hashSync(val, 10) : val;
    },
  })
  password: string;

  @Field()
  @Prop({ unique: true })
  nickname: string;

  @Field({ nullable: true })
  @Prop()
  firstName: string;

  @Field({ nullable: true })
  @Prop()
  lastName: string;

  @Field()
  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Field({ nullable: true })
  @Prop({ default: '' })
  description: string;

  // @Prop()
  // authToken: string;
  @Field(() => [ID], { nullable: true })
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Attraction' }], default: [] })
  savedAttractions: Attraction[];

  @Field(() => [ID], { nullable: true })
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Restaurant' }], default: [] })
  savedRestaurants: Restaurant[];

  @Field(() => ID)
  @Prop({ type: mongoose.Types.ObjectId, ref: 'PermissionGroup', default: '' })
  permissionGroupId: PermissionGroup;

  @Field(() => Photo)
  @Prop({ type: PhotoSchema })
  userAvatar: Photo;

  @Prop()
  emailToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
