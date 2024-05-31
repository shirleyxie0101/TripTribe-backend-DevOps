import mongoose from 'mongoose';

import { Address } from '@/schema/address.schema';
import { BusinessTime } from '@/schema/businessTime.schema';
import { Photo } from '@/schema/photo.schema';
import { PlaceType } from '@/search/dto/globalSearch.dto';

export interface IResultWithType {
  name: string;
  description: string;
  website?: string;
  email: string;
  phone: string;
  openHours: {
    Monday: BusinessTime;
    Tuesday: BusinessTime;
    Wednesday: BusinessTime;
    Thursday: BusinessTime;
    Friday: BusinessTime;
    Saturday: BusinessTime;
    Sunday: BusinessTime;
  };
  address: Address;
  overAllRating?: number;
  photos: Photo[];
  createdUserId: mongoose.Types.ObjectId;
  distance?: number;
  type: PlaceType.RESTAURANT | PlaceType.ATTRACTION;
}
