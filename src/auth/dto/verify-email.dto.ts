import { IsMongoId, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsMongoId()
  readonly userId: string;

  @IsString()
  readonly token: string;
}
