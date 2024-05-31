import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionGroupService } from './permission-group.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly permissionGroupService: PermissionGroupService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user.permissionGroupId) {
      return false;
    }

    const permissionGroupDoc = await this.permissionGroupService.getPermissionGroupById(
      user.permissionGroupId.toString()
    );

    if (!permissionGroupDoc) {
      return false;
    }

    return permissionGroupDoc.permissions.includes(requiredPermissions);
  }
}
