import { ApiProperty } from '@nestjs/swagger/dist';
import { IsString, MinLength } from 'class-validator';

import { ResetPasswordDto } from '../../auth/dto/reset-password.dto';

export class EditPasswordDto extends ResetPasswordDto {
  @ApiProperty({ example: 'Abc4567890+', required: true })
  @MinLength(8)
  @IsString()
  oldPassword: string;
}
