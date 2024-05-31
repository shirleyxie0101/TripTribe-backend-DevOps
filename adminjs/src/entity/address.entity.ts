import { model, Schema } from 'mongoose';

export interface ILocation {
  lng: number;
  lat: number;
}

export const LocationSchema = new Schema<ILocation>({
  lng: { type: 'number', required: true },
  lat: { type: 'number', required: true },
});

export interface IAddress {
  formattedAddress: string;
  location: ILocation;
}

export const AddressSchema = new Schema<IAddress>({
  formattedAddress: { type: 'String', required: true },
  location: { type: LocationSchema, required: true },
});
