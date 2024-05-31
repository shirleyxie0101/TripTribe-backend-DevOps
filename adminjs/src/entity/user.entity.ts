import { model, Schema } from 'mongoose';
import { IPhoto, PhotoSchema } from './photo.entity.js';

export interface IUser {
  email: string;
  password: string;
  nickname: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  description: string;
  savedAttractions: string[];
  savedRestaurants: string[];
  userAvatar: IPhoto[];
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS_OWNER = 'business_owner',
}

export const UserSchema = new Schema<IUser>(
  {
    email: { type: 'String', required: true },
    password: { type: 'String', required: true },
    nickname: { type: 'String', required: false },
    firstName: { type: 'String', required: false },
    lastName: { type: 'String', required: false },
    role: { type: String, enum: Object.values(UserRole), required: true },
    description: { type: 'String', required: false },
    savedAttractions: { type: [String], required: false },
    savedRestaurants: { type: [String], required: false },
    userAvatar: { type: [PhotoSchema], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
