import { TABLE_CONSTANTS } from '../core/constants/table.constants';

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'payment' | 'unsynced';

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
}

export interface TableStatusConfig {
  color: string;
  backgroundColor: string;
  borderColor: string;
  icon?: string;
}

// Use centralized constants - change values in TABLE_CONSTANTS.STATUS_CONFIG
export const TABLE_STATUS_CONFIG: Record<TableStatus, TableStatusConfig> = TABLE_CONSTANTS.STATUS_CONFIG;

