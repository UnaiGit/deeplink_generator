/**
 * Drag and drop related interfaces
 */

import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model';
import { Table } from '../../utils/table.model';

export interface DragDropState {
  draggedTable: Table | null;
  dragOverTable: Table | null;
  lastHoveredTableId: string | null;
  pendingDepartmentId: string | null;
  pendingRedraw: number | null; // requestAnimationFrame id
}

export interface DragDropFeedback {
  table: Table;
  department: Department;
  message?: string;
}

export interface DragDropEventData {
  department?: Department;
  employee?: Employee;
  table?: Table;
  screenX: number;
  screenY: number;
  timestamp: number;
}

export interface DragDropResult {
  success: boolean;
  targetTable: Table | null;
  department?: Department;
  employee?: Employee;
  error?: string;
}

