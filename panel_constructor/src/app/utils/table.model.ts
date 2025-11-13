import { TABLE_CONSTANTS } from '../core/constants/table.constants';

export type TableStatus =
  | 'free'
  | 'booked'
  | 'noShow'
  | 'occupied'
  | 'pendingPayment'
  | 'overstay'
  | 'unsynced';

export interface TableIndicators {
  dishReady?: boolean;
  paymentRequested?: boolean;
  overCapacity?: boolean;
}

export interface TableOrderSummary {
  title: string;
  delivered?: number;
  total?: number;
  preparing?: number;
  sent?: number;
  pending?: number;
  location?: string;
  eta?: string;
  note?: string;
}

export interface Table {
  id: string;
  label: string;
  status: TableStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  seats?: number;
  shape?: 'rectangular' | 'round' | 'square';
  department?: string; // Department assigned to this table
  occupiedChairs?: number[]; // Array of chair numbers (1-indexed) that are occupied
  widthGrid?: number;
  heightGrid?: number;
  capacity?: number;
  maxStayMinutes?: number;
  syncedAt?: string;
  guestCount?: number;
  waiterName?: string;
  runnerName?: string;
  timeSeatedMinutes?: number;
  orderSummary?: TableOrderSummary[];
  indicators?: TableIndicators;
  notes?: string;
  rotation?: number; // Rotation angle in degrees (0, 90, 180, 270)
  readyAtPassCount?: number;
  readyAtPassSinceLabel?: string;
  paymentRequestedAgoLabel?: string;
}

export interface TableStatusConfig {
  color: string;
  backgroundColor: string;
  borderColor: string;
  label: string;
  icon?: string;
}

// Use centralized constants - change values in TABLE_CONSTANTS.STATUS_CONFIG
export const TABLE_STATUS_CONFIG: Record<TableStatus, TableStatusConfig> = TABLE_CONSTANTS.STATUS_CONFIG;

