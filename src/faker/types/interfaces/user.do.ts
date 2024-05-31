import { IPhoto } from './photo.do';

export interface IUser {
  email: string;
  password: string;
  nickname: string;
  firstName: string;
  lastName: string;
  description: string;
  savedAttractions: string[];
  savedRestaurants: string[];
  userAvatar: IPhoto;
}
