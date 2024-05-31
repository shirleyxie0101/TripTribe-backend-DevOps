import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PermissionGroupService } from './permission-group.service';
import { PermissionGroup, PermissionGroupSchema } from './schema/permissionGroup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PermissionGroup.name, schema: PermissionGroupSchema }]),
  ],
  exports: [PermissionGroupService],
  providers: [PermissionGroupService],
})
export class PermissionGroupModule {}
