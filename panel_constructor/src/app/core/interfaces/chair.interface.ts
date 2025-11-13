/**
 * Chair-related interfaces
 */

import { Table } from '../../utils/table.model';

export interface ChairPosition {
  table: Table;
  chairNumber: number;
}

export interface ChairClickEvent extends ChairPosition {
  totalSeats: number;
  occupiedSeats: number;
  freeSeats: number;
  occupiedList: string;
}

export interface SeatDistribution {
  leftSide: number;
  rightSide: number;
}

