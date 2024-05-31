import { Field, ObjectType } from '@nestjs/graphql';
import { Schema } from '@nestjs/mongoose';

import { BusinessTime } from './businessTime.schema';

@ObjectType()
@Schema({ _id: false })
export class OpenHours {
  @Field(() => BusinessTime)
  Monday: BusinessTime;

  @Field(() => BusinessTime)
  Tuesday: BusinessTime;

  @Field(() => BusinessTime)
  Wednesday: BusinessTime;

  @Field(() => BusinessTime)
  Thursday: BusinessTime;

  @Field(() => BusinessTime)
  Friday: BusinessTime;

  @Field(() => BusinessTime)
  Saturday: BusinessTime;

  @Field(() => BusinessTime)
  Sunday: BusinessTime;
}
