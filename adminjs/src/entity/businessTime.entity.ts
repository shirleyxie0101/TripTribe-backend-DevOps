import { model, Schema } from 'mongoose';

export interface IPeriod {
  openTime: string;
  closeTime: string;
}

export const PeriodSchema = new Schema<IPeriod>({
  openTime: { type: 'String', required: true },
  closeTime: { type: 'String', required: true },
});

export interface IBusinessTime {
  isOpenAllDay: boolean;
  isClosed: boolean;
  period: IPeriod[];
}

export const BusinessTimeSchema = new Schema<IBusinessTime>({
  isOpenAllDay: { type: 'boolean', required: true },
  isClosed: { type: 'boolean', required: true },
  period: { type: [PeriodSchema], required: true },
});
