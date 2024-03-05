export interface IEvent {
  name: string;
  date: Date;
  isAllDay: boolean;
  startTime?: Date;
  endTime?: Date;
  color: string;
}
