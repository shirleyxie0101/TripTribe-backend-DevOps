import { model, Schema } from 'mongoose';

enum PhotoType {
  ATTRACTION = 'Attraction',
  RESTAURANT = 'Restaurant',
  USER = 'User',
  REVIEW = 'Review',
}
export interface IPhoto {
  imageAlt: string;
  imageUrl: string;
  imageType: PhotoType;
  uploadUserId: string;
}

export const PhotoSchema = new Schema<IPhoto>({
  imageAlt: { type: 'String', required: true },
  imageUrl: { type: 'String', required: true },
  imageType: { type: 'String', enum: PhotoType, required: true },
  uploadUserId: { type: 'String', required: true },
});

export const Photo = model<IPhoto>('Photo', PhotoSchema);
