import { TimeRange } from '../../employees/time-range.type';

export interface EmployeeDetails {
  id: number;
  name: string;
  roles: string[];
  avatarUrl?: string;
  phone: string;
  email: string;
  rating: number; // 0-5
  workingHours: TimeRange;
  status: 'active' | 'inactive' | 'suspended';
  rank: number;
  productivity: ProductivityData;
  aiInsight: AIInsightData;
  kpis?: KPIData;
  shiftSchedule?: ShiftScheduleData;
}

export interface ProductivityData {
  avgTime: string; // e.g., "08:25"
  completedOrders: number;
  goalAttainment: number; // percentage 0-100
}

export interface AIInsightData {
  message: string;
  highlightValue?: string; // e.g., "12%"
}

export interface KPIData {
  orderDeliverySpeed: { value: string; change: string; isPositive: boolean };
  orderAccuracy: { value: string; change: string; isPositive: boolean; percentage: number };
  tablesManaged: { value: string; change: string; isPositive: boolean };
  tableNPS: { value: number };
  dishesPerHour: { value: number; change: string; isPositive: boolean };
  avgPrepTime: { value: string; change: string; isPositive: boolean };
  delayedTasks: { value: string; change: string; isPositive: boolean };
  daysAttended: { value: number };
  taskReassignments: { value: number };
  engagement: { emoji: string };
}

export interface ShiftScheduleData {
  days: DaySchedule[];
}

export interface DaySchedule {
  dayName: string;
  shifts: ShiftBlock[];
}

export interface ShiftBlock {
  timeRange: string;
  role: string;
}


