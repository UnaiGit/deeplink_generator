import { TimeRange } from '../../employees/time-range.type';

export interface ShiftEntry {
  employeeName: string;
  dayIndex: number; // 0=Sun ... 6=Sat
  range: TimeRange;
  role: string;
  color?: 'blue' | 'pink' | 'yellow' | 'green';
}


