import { IAddress } from './address.do';
import { IBusinessTime } from './businessTime.do';
import { IPhoto } from './photo.do';

export interface IRestaurant {
  name: string;
  description: string;
  website?: string;
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
  tags: {
    meals: string[];
    cuisines: string[];
    cost: number;
  };
}
