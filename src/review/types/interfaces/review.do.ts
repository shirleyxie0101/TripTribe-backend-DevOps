import { CreatePhotoDto } from '@/file/dto/create-photo.dto';

export interface IReview {
  title?: string;
  description?: string;
  rating?: number;
  userId: string;
  placeId?: string;
  photos?: CreatePhotoDto[];
  placeType?: string;
}
