import { ApiProperty } from '@nestjs/swagger/dist';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTU3MzNlNThiYjMyODVlNjk5ZmJiNzciLCJpYXQiOjE3MDA0NzY1NzUsImV4cCI6MTcwMDUxOTc3NX0.g_-C7ngEIjDHjPuaM-vkd_2eawxQLpDHQ35byae2FUI',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
