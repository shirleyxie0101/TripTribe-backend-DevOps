import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { Permission } from '@/common/constant/permission.constant';

export type PermissionGroupDocument = mongoose.HydratedDocument<PermissionGroup>;

@Schema({ timestamps: true })
export class PermissionGroup {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: [] })
  permissions: Permission[];
}

export const PermissionGroupSchema = SchemaFactory.createForClass(PermissionGroup);
