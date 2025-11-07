export interface StatusItem {
  color: string;
  label: string;
}
export type FloorType = 'major' | 'terrace' | 'main' | 'kitchen';

export interface TableConfig {
  id: string;
  type: 'rectangular' | 'round' | 'square';
  seats: number;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  radius?: number;
}

export interface FloorPlan {
  floorType: FloorType;
  tables: TableConfig[];
  objects: CanvasObject[];
}

export interface CanvasObject {
  id: string;
  type: 'svg' | 'shape';
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}