/**
 * Table configuration related interfaces
 */

import { Table } from '../../utils/table.model';

export interface TableCapacityPreset {
  width: number;
  height: number;
  shape: Table['shape'];
}

export interface TableCapacityPresets {
  [capacity: number]: TableCapacityPreset;
}

export interface TableConfigOriginal {
  seats?: number;
  capacity?: number;
  widthGrid?: number;
  heightGrid?: number;
  maxStayMinutes?: number;
  width?: number;
  height?: number;
  shape?: Table['shape'];
  x?: number;
  y?: number;
  occupiedChairs?: number[];
}

export interface TableIdentity {
  id: string;
  label: string;
}

export interface TableLayoutItem {
  table: Table;
  w: number; // effective width including chairs
  h: number; // effective height including chairs
  leftExtra: number;
  topExtra: number;
  rightExtra: number;
  bottomExtra: number;
  capacity: number;
}

