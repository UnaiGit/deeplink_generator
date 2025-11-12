import { FloorType } from '../components/Models/interface-legends';
import { Table } from './table.model';

/**
 * Get tables for Main Floor
 * Tables are spaced side by side with no overlaps
 * Spacing accounts for chairs: 18px width, 14px height, plus 40px gap between tables
 */
export function getMainFloorTables(): Table[] {
  const CHAIR_WIDTH = 18; // Chair extends left/right
  const CHAIR_HEIGHT = 14; // Chair extends top/bottom
  const TABLE_SPACING = 40; // Minimum gap between tables
  
  // Row 1: y = 100
  let currentX = 50;
  const row1Y = 100;
  
  const t01 = {
    id: 'main-01',
    label: 'T01',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 80,
    height: 80,
    seats: 2,
    shape: 'square' as const
  };
  currentX += 80 + CHAIR_WIDTH * 2 + TABLE_SPACING; // Table + chairs on both sides + spacing
  
  const t02 = {
    id: 'main-02',
    label: 'T02',
    status: 'occupied' as const,
    x: currentX,
    y: row1Y,
    width: 80,
    height: 80,
    seats: 2,
    shape: 'square' as const,
    occupiedChairs: [1]
  };
  currentX += 80 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t03 = {
    id: 'main-03',
    label: 'T03',
    status: 'reserved' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t04 = {
    id: 'main-04',
    label: 'T04',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING; // Rectangular: chairs on top/bottom
  
  const t05 = {
    id: 'main-05',
    label: 'T05',
    status: 'payment' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 180,
    seats: 8,
    shape: 'rectangular' as const
  };
  
  // Row 2: Calculate based on tallest table in row 1 + chairs + spacing
  const row1MaxHeight = Math.max(80, 80, 100, 100, 180); // Max table height in row 1
  const row2Y = row1Y + row1MaxHeight + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  currentX = 50;
  const t06 = {
    id: 'main-06',
    label: 'T06',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 80,
    height: 80,
    seats: 2,
    shape: 'square' as const
  };
  currentX += 80 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t07 = {
    id: 'main-07',
    label: 'T07',
    status: 'occupied' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const,
    occupiedChairs: [1, 3]
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t08 = {
    id: 'main-08',
    label: 'T08',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t09 = {
    id: 'main-09',
    label: 'T09',
    status: 'reserved' as const,
    x: currentX,
    y: row2Y,
    width: 240,
    height: 120,
    seats: 12,
    shape: 'rectangular' as const,
    occupiedChairs: [1, 3, 6, 9, 12]
  };
  currentX += 240 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t10 = {
    id: 'main-10',
    label: 'T10',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  
  return [t01, t02, t03, t04, t05, t06, t07, t08, t09, t10];
}

/**
 * Get tables for Terrace Floor
 * Tables are spaced side by side with no overlaps
 * Spacing accounts for chairs: 18px width, 14px height, plus 40px gap between tables
 */
export function getTerraceFloorTables(): Table[] {
  const CHAIR_WIDTH = 18;
  const CHAIR_HEIGHT = 14;
  const TABLE_SPACING = 40;
  
  // Row 1
  let currentX = 50;
  const row1Y = 100;
  
  const t01 = {
    id: 'terrace-01',
    label: 'T01',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 80,
    height: 80,
    seats: 2,
    shape: 'square' as const
  };
  currentX += 80 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t02 = {
    id: 'terrace-02',
    label: 'T02',
    status: 'occupied' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t03 = {
    id: 'terrace-03',
    label: 'T03',
    status: 'reserved' as const,
    x: currentX,
    y: row1Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t04 = {
    id: 'terrace-04',
    label: 'T04',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 180,
    seats: 8,
    shape: 'rectangular' as const
  };
  
  // Row 2: Calculate based on tallest table in row 1
  const row1MaxHeight = Math.max(80, 100, 100, 180);
  const row2Y = row1Y + row1MaxHeight + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  currentX = 50;
  const t05 = {
    id: 'terrace-05',
    label: 'T05',
    status: 'payment' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t06 = {
    id: 'terrace-06',
    label: 'T06',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 80,
    height: 80,
    seats: 2,
    shape: 'square' as const
  };
  currentX += 80 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t07 = {
    id: 'terrace-07',
    label: 'T07',
    status: 'occupied' as const,
    x: currentX,
    y: row2Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const,
    occupiedChairs: [1, 4]
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t08 = {
    id: 'terrace-08',
    label: 'T08',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  
  return [t01, t02, t03, t04, t05, t06, t07, t08];
}

/**
 * Get tables for Kitchen Floor
 */
export function getKitchenFloorTables(): Table[] {
  return [
    {
      id: 'kitchen-01',
      label: 'S1',
      status: 'available',
      x: 100,
      y: 150,
      width: 120,
      height: 120,
      seats: 0,
      shape: 'square'
    },
    {
      id: 'kitchen-02',
      label: 'S2',
      status: 'occupied',
      x: 300,
      y: 150,
      width: 120,
      height: 120,
      seats: 0,
      shape: 'square'
    },
    {
      id: 'kitchen-03',
      label: 'S3',
      status: 'available',
      x: 500,
      y: 150,
      width: 120,
      height: 120,
      seats: 0,
      shape: 'square'
    }
  ];
}

/**
 * Get tables for Major Floor
 * Tables are spaced side by side with no overlaps
 * Spacing accounts for chairs: 18px width, 14px height, plus 40px gap between tables
 */
export function getMajorFloorTables(): Table[] {
  const CHAIR_WIDTH = 18;
  const CHAIR_HEIGHT = 14;
  const TABLE_SPACING = 40;
  
  // Row 1
  let currentX = 60;
  const row1Y = 120;
  
  const t01 = {
    id: 'major-01',
    label: 'VIP1',
    status: 'reserved' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t02 = {
    id: 'major-02',
    label: 'VIP2',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t03 = {
    id: 'major-03',
    label: 'VIP3',
    status: 'occupied' as const,
    x: currentX,
    y: row1Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t04 = {
    id: 'major-04',
    label: 'VIP4',
    status: 'reserved' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t03b = {
    id: 'major-03b',
    label: 'VIP3B',
    status: 'available' as const,
    x: currentX,
    y: row1Y,
    width: 100,
    height: 180,
    seats: 8,
    shape: 'rectangular' as const
  };
  
  // Row 2: Calculate based on tallest table in row 1
  const row1MaxHeight = Math.max(100, 100, 100, 100, 180);
  const row2Y = row1Y + row1MaxHeight + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  currentX = 60;
  const t05 = {
    id: 'major-05',
    label: 'VIP5',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t06 = {
    id: 'major-06',
    label: 'VIP6',
    status: 'payment' as const,
    x: currentX,
    y: row2Y,
    width: 180,
    height: 100,
    seats: 6,
    shape: 'rectangular' as const
  };
  currentX += 180 + CHAIR_HEIGHT * 2 + TABLE_SPACING;
  
  const t07 = {
    id: 'major-07',
    label: 'VIP7',
    status: 'available' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  currentX += 100 + CHAIR_WIDTH * 2 + TABLE_SPACING;
  
  const t08 = {
    id: 'major-08',
    label: 'VIP8',
    status: 'reserved' as const,
    x: currentX,
    y: row2Y,
    width: 100,
    height: 100,
    seats: 4,
    shape: 'square' as const
  };
  
  return [t01, t02, t03, t04, t03b, t05, t06, t07, t08];
}

/**
 * Get tables for a specific floor
 */
export function getFloorTables(floor: FloorType): Table[] {
  switch (floor) {
    case 'main':
      return getMainFloorTables();
    case 'terrace':
      return getTerraceFloorTables();
    case 'kitchen':
      return getKitchenFloorTables();
    case 'major':
      return getMajorFloorTables();
    default:
      return [];
  }
}

