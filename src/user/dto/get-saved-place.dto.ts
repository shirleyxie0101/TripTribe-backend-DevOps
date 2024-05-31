import { IsEnum } from 'class-validator';

export enum PlaceType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
}

export class getSavedPlaceDto {
  @IsEnum(PlaceType)
  placeType: string;
}
