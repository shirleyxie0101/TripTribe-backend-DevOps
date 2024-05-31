// send-verification-email.dto.ts
import { IsEmail, IsString, IsMongoId } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly token: string;

  @IsMongoId()
  readonly createdUserId: string;

  @IsString()
  readonly hostname: string;
}
