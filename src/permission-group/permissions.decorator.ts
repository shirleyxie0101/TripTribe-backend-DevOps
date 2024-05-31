import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (Permission) => SetMetadata(PERMISSIONS_KEY, Permission);
