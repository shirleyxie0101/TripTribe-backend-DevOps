import { IPhoto } from './photo.do';

export enum PlaceType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
}

export interface IReview {
  title: string;
  description: string;
  rating: number;
  photos: IPhoto[];
  userId: string;
  placeId: string;
  placeType: PlaceType;
}
