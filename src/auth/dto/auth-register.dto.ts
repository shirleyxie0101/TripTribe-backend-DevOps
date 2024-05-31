import { IsNotEmpty, IsString } from 'class-validator';

import { BaseUserDto } from '@/user/dto/base-user.dto';

export class AuthRegisterDto extends BaseUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
