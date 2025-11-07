import { FloorType } from '../components/Models/interface-legends';
import { Table } from './table.model';

/**
 * Get tables for Main Floor
 */
export function getMainFloorTables(): Table[] {
  return [
    {
      id: 'main-01',
      label: 'T01',
      status: 'available',
      x: 50,
      y: 100,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-02',
      label: 'T02',
      status: 'occupied',
      x: 200,
      y: 100,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-03',
      label: 'T03',
      status: 'reserved',
      x: 350,
      y: 100,
      width: 120,
      height: 100,
      seats: 6,
      shape: 'rectangular'
    },
    {
      id: 'main-04',
      label: 'T04',
      status: 'available',
      x: 500,
      y: 100,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-05',
      label: 'T05',
      status: 'payment',
      x: 650,
      y: 100,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-06',
      label: 'T06',
      status: 'available',
      x: 50,
      y: 240,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-07',
      label: 'T07',
      status: 'occupied',
      x: 200,
      y: 240,
      width: 120,
      height: 100,
      seats: 6,
      shape: 'rectangular'
    },
    {
      id: 'main-08',
      label: 'T08',
      status: 'available',
      x: 350,
      y: 240,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-09',
      label: 'T09',
      status: 'reserved',
      x: 500,
      y: 240,
      width: 120,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'main-10',
      label: 'T10',
      status: 'available',
      x: 650,
      y: 240,
      width: 120,
      height: 100,
      seats: 6,
      shape: 'rectangular'
    }
  ];
}

/**
 * Get tables for Terrace Floor
 */
export function getTerraceFloorTables(): Table[] {
  return [
    {
      id: 'terrace-01',
      label: 'T01',
      status: 'available',
      x: 80,
      y: 150,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    },
    {
      id: 'terrace-02',
      label: 'T02',
      status: 'occupied',
      x: 200,
      y: 150,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    },
    {
      id: 'terrace-03',
      label: 'T03',
      status: 'reserved',
      x: 320,
      y: 150,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    },
    {
      id: 'terrace-04',
      label: 'T04',
      status: 'available',
      x: 80,
      y: 280,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    },
    {
      id: 'terrace-05',
      label: 'T05',
      status: 'payment',
      x: 200,
      y: 280,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    },
    {
      id: 'terrace-06',
      label: 'T06',
      status: 'available',
      x: 320,
      y: 280,
      width: 80,
      height: 80,
      seats: 4,
      shape: 'round'
    }
  ];
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
 */
export function getMajorFloorTables(): Table[] {
  return [
    {
      id: 'major-01',
      label: 'VIP1',
      status: 'reserved',
      x: 60,
      y: 120,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'major-02',
      label: 'VIP2',
      status: 'available',
      x: 240,
      y: 120,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'major-03',
      label: 'VIP3',
      status: 'occupied',
      x: 420,
      y: 120,
      width: 140,
      height: 100,
      seats: 6,
      shape: 'rectangular'
    },
    {
      id: 'major-04',
      label: 'VIP4',
      status: 'reserved',
      x: 600,
      y: 120,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'major-05',
      label: 'VIP5',
      status: 'available',
      x: 60,
      y: 270,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'major-06',
      label: 'VIP6',
      status: 'payment',
      x: 240,
      y: 270,
      width: 140,
      height: 100,
      seats: 6,
      shape: 'rectangular'
    },
    {
      id: 'major-07',
      label: 'VIP7',
      status: 'available',
      x: 420,
      y: 270,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    },
    {
      id: 'major-08',
      label: 'VIP8',
      status: 'reserved',
      x: 600,
      y: 270,
      width: 140,
      height: 100,
      seats: 4,
      shape: 'rectangular'
    }
  ];
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

