/**
 * Canvas-related interfaces for floor canvas component
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Bounds2D extends Point2D, Size2D {}

import type { Table } from '../../utils/table.model';

export interface DragState {
  isDragging: boolean;
  draggedTable: Table | null; // table object
  dragOffset: Point2D;
  hasDragMovement: boolean;
  dragEnabled: boolean;
}

export interface PanState {
  isPanning: boolean;
  panStart: Point2D;
  panOffset: Point2D;
  isPanModeActive: boolean;
  pendingPanActivation: boolean;
  spacePressed: boolean;
}

export interface ZoomState {
  level: number;
  min: number;
  max: number;
  step: number;
}

export interface CanvasOffset {
  x: number;
  y: number;
}

export interface CanvasViewport {
  width: number;
  height: number;
}

export interface CanvasCoordinates {
  canvasX: number;
  canvasY: number;
}

export interface TablePosition {
  x: number;
  y: number;
}

export interface TablePositionsMap {
  [floor: string]: Record<string, TablePosition>;
}

export interface FloorOffsets {
  [floor: string]: CanvasOffset;
}

