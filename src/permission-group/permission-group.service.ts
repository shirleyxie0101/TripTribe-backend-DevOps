import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetPermissionGroupDto } from './dto/get-permissionGroup.dto';
import { PermissionGroup } from './schema/permissionGroup.schema';

@Injectable()
export class PermissionGroupService {
  constructor(
    @InjectModel(PermissionGroup.name) private permissionGroupModel: Model<PermissionGroup>
  ) {}

  async getPermissionGroupById(id: GetPermissionGroupDto) {
    const permissionGroupDoc = await this.permissionGroupModel.findById(id);
    if (!permissionGroupDoc) {
      throw new NotFoundException('PermissionGroup does not exist');
    }
    return permissionGroupDoc;
  }
}
