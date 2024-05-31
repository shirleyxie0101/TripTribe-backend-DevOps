import { IsMongoId } from 'class-validator';

export class GetPermissionGroupDto {
  @IsMongoId()
  id: string;
}
