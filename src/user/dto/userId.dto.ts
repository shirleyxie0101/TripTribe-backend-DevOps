import { IsMongoId } from 'class-validator';

export class UserIdDto {
  @IsMongoId()
  _id: string;
}
