import { IsEnum, IsMongoId } from 'class-validator';

export enum PlaceType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
}

export class deleteSavedPlaceDto {
  @IsEnum(PlaceType)
  placeType: string;
  //need to find out the whether placeId is attraction or restaurant in service
  @IsMongoId()
  placeId: string;
}
