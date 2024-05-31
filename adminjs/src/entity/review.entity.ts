import { model, Schema } from 'mongoose';
import { IPhoto, PhotoSchema } from './photo.entity.js';

enum PlaceType {
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

export const ReviewSchema = new Schema<IReview>({
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  rating: { type: 'number', required: true },
  photos: { type: [PhotoSchema], required: false },
  userId: { type: 'string', ref: 'User', required: true },
  placeId: { type: 'string', required: true },
  placeType: { type: String, enum: Object.values(PlaceType), required: true },
});

export const Review = model<IReview>('Review', ReviewSchema);
