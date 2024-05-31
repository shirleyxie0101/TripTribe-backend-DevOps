import { CreatePhotoDto } from '@/file/dto/create-photo.dto';

export interface ICreateAttaraction {
  name?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  createdUserId: string;
  photos?: CreatePhotoDto[];
}
