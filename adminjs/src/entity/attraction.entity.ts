import { model, Schema } from 'mongoose';
import { IPhoto, PhotoSchema } from './photo.entity.js';
import { BusinessTimeSchema, IBusinessTime } from './businessTime.entity.js';
import { AddressSchema, IAddress } from './address.entity.js';

export interface IAttraction {
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  openHours: {
    Monday: IBusinessTime;
    Tuesday: IBusinessTime;
    Wednesday: IBusinessTime;
    Thursday: IBusinessTime;
    Friday: IBusinessTime;
    Saturday: IBusinessTime;
    Sunday: IBusinessTime;
  };
  address: IAddress;
  overAllRating: number;
  photos: IPhoto[];
  createdUserId: string;
}

export const AttractionSchema = new Schema<IAttraction>({
  name: { type: 'string', required: true },
  description: { type: 'string', required: true },
  website: { type: 'string', required: false },
  email: { type: 'string', required: true },
  phone: { type: 'string', required: true },
  openHours: {
    _id: false,
    type: {
      Monday: BusinessTimeSchema,
      Tuesday: BusinessTimeSchema,
      Wednesday: BusinessTimeSchema,
      Thursday: BusinessTimeSchema,
      Friday: BusinessTimeSchema,
      Saturday: BusinessTimeSchema,
      Sunday: BusinessTimeSchema,
    },
    default: {},
  },
  address: { type: AddressSchema, required: false },
  overAllRating: { type: 'number', required: false },
  photos: { type: [PhotoSchema], required: false },
  createdUserId: { type: 'string', required: true },
});

export const Attraction = model<IAttraction>('Attraction', AttractionSchema);
