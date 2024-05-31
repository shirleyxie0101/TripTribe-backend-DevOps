export interface IPeriod {
  openTime: string;
  closeTime: string;
}

export interface IBusinessTime {
  isOpenAllDay: boolean;
  isClosed: boolean;
  period: IPeriod[];
}
