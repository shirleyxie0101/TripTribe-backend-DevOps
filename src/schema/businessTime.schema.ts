import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ _id: false })
export class Period {
  @Field()
  @Prop({ required: true })
  openTime: string;

  @Field()
  @Prop({ required: true })
  closeTime: string;
}

const PeriodSchema = SchemaFactory.createForClass(Period);

@ObjectType()
@Schema({ _id: false })
export class BusinessTime {
  @Field({ defaultValue: false })
  @Prop({ required: true })
  isOpenAllDay: boolean;

  @Field({ defaultValue: true })
  @Prop({ required: true })
  isClosed: boolean;

  @Field(() => [Period], { nullable: true })
  @Prop({ type: [PeriodSchema], default: [] })
  period?: Period[];
}

export const BusinessTimeSchema = SchemaFactory.createForClass(BusinessTime);
