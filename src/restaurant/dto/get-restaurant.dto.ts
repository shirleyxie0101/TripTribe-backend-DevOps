import { IsMongoId } from 'class-validator';

export class RestaurantFindOneDto {
  @IsMongoId()
  id: string;
}
