import { FloorType } from '../components/Models/interface-legends';
import { Table } from './table.model';
import { KitchenItem } from '../core/interfaces/kitchen.interface';

const TABLE_STATUS_PRESETS: ReadonlyArray<Partial<Table>> = [
  {
    status: 'free',
    guestCount: 0,
    waiterName: '—',
    runnerName: '—',
    timeSeatedMinutes: 0,
    maxStayMinutes: 90,
    orderSummary: [],
    indicators: {},
    notes: 'Ready for walk-ins.'
  },
  {
    status: 'occupied',
    guestCount: 5,
    waiterName: 'Laura M.',
    runnerName: 'Pedro',
    timeSeatedMinutes: 42,
    maxStayMinutes: 90,
    orderSummary: [
      { title: 'Starters', delivered: 4, total: 4 },
      { title: 'Mains', preparing: 2, sent: 1, pending: 1, eta: '06:10' },
      { title: 'Drinks', delivered: 3, pending: 1, location: 'Bar' }
    ],
    indicators: { dishReady: true, paymentRequested: true },
    readyAtPassCount: 2,
    readyAtPassSinceLabel: 'since 01:05',
    paymentRequestedAgoLabel: '03:12 ago',
    notes: 'Gluten-free (Ana).'
  },
  {
    status: 'booked',
    guestCount: 0,
    waiterName: 'Assigned soon',
    runnerName: '—',
    timeSeatedMinutes: 0,
    maxStayMinutes: 90,
    orderSummary: [
      { title: 'Starters', delivered: 0, total: 2 },
      { title: 'Mains', pending: 2 },
      { title: 'Drinks', pending: 2 }
    ],
    indicators: {},
    notes: 'Party of two arriving in 15 minutes.'
  },
  {
    status: 'noShow',
    guestCount: 0,
    waiterName: 'Shift lead',
    runnerName: '—',
    timeSeatedMinutes: 90,
    maxStayMinutes: 60,
    orderSummary: [],
    indicators: {},
    notes: 'Reservation marked as no-show.'
  },
  {
    status: 'pendingPayment',
    guestCount: 3,
    waiterName: 'Diego R.',
    runnerName: 'Sofia',
    timeSeatedMinutes: 104,
    maxStayMinutes: 90,
    orderSummary: [
      { title: 'Mains', delivered: 3, total: 3 },
      { title: 'Desserts', delivered: 2, pending: 1, eta: '04:45' }
    ],
    indicators: { paymentRequested: true },
    paymentRequestedAgoLabel: '01:45 ago',
    notes: 'Card terminal requested.'
  },
  {
    status: 'overstay',
    guestCount: 6,
    waiterName: 'Aisha P.',
    runnerName: 'Jon',
    timeSeatedMinutes: 140,
    maxStayMinutes: 120,
    orderSummary: [
      { title: 'Desserts', pending: 2, eta: '08:20' },
      { title: 'Drinks', delivered: 5, pending: 1, location: 'Bar' }
    ],
    indicators: { dishReady: true, paymentRequested: true, overCapacity: true },
    readyAtPassCount: 1,
    readyAtPassSinceLabel: 'since 02:10',
    paymentRequestedAgoLabel: '06:30 ago',
    notes: 'Extra chairs pulled from storage.'
  }
];

function applyTableMetadata(table: Table, index: number): void {
  const preset = TABLE_STATUS_PRESETS[index % TABLE_STATUS_PRESETS.length];
  if (!preset) {
    return;
  }

  table.status = preset.status ?? 'free';
  table.guestCount = preset.guestCount ?? table.guestCount;
  table.waiterName = preset.waiterName ?? table.waiterName;
  table.timeSeatedMinutes = preset.timeSeatedMinutes ?? table.timeSeatedMinutes;
  table.maxStayMinutes = preset.maxStayMinutes ?? table.maxStayMinutes;
  table.notes = preset.notes ?? table.notes;

  if (preset.orderSummary) {
    table.orderSummary = preset.orderSummary.map(section => ({ ...section }));
  } else if (!table.orderSummary) {
    table.orderSummary = [];
  }

  if (preset.indicators) {
    table.indicators = { ...preset.indicators };
  } else {
    table.indicators = {};
  }

  if (!table.capacity && table.seats) {
    table.capacity = table.seats;
  }

  if (table.seats === 4 || table.seats === 6) {
    table.rotation = 90;
  }

  const seats = table.seats ?? 0;
  const guests = Math.max(0, Math.min(seats, table.guestCount ?? 0));
  table.occupiedChairs =
    guests > 0 ? Array.from({ length: guests }, (_, idx) => idx + 1) : [];
}

/**
 * Get tables for Main Floor
 * Tables are arranged vertically in columns
 * Large tables (>6) are placed first, then small tables below them in the same column
 * This prevents overflow and ensures proper spacing
 */
export function getMainFloorTables(): Table[] {
  const layout: Array<Table> = [];
  const margin = 80;
  const horizontalGap = 280; // Space between columns
  const verticalGap = 60; // Space between tables vertically
  const maxCanvasHeight = 4000; // Maximum canvas height to prevent overflow

  const tableShapes: Array<{ width: number; height: number; seats: number; shape: Table['shape'] }> = [
    { width: 120, height: 127, seats: 2, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
    { width: 126, height: 283, seats: 6, shape: 'rectangular' },
    { width: 150, height: 480, seats: 12, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
    { width: 126, height: 283, seats: 6, shape: 'rectangular' },
  ];

  // Separate tables into groups: small (< 6), 6-seaters, and large (> 6)
  const smallTables: typeof tableShapes = [];
  const sixSeaterTables: typeof tableShapes = [];
  const largeTables: typeof tableShapes = [];

  tableShapes.forEach(shape => {
    if (shape.seats === 6) {
      sixSeaterTables.push(shape);
    } else if (shape.seats > 6) {
      largeTables.push(shape);
    } else {
      smallTables.push(shape);
    }
  });

  let tableIndex = 0;
  let currentColumn = 0;

  // Column 1: Large tables first, then small tables below them
  if (largeTables.length > 0 || smallTables.length > 0) {
    let currentY = margin;
    
    // First, place large tables
    for (const shape of largeTables) {
      // Check if adding this table would cause overflow
      if (currentY + shape.height > maxCanvasHeight - margin) {
        // Move to next column
        currentColumn++;
        currentY = margin;
      }
      
      const table: Table = {
        id: `main-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
    
    // Then, place small tables below large tables in the same column
    for (const shape of smallTables) {
      // Check if adding this table would cause overflow
      if (currentY + shape.height > maxCanvasHeight - margin) {
        // Move to next column
        currentColumn++;
        currentY = margin;
      }
      
      const table: Table = {
        id: `main-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  // Column 2 (or next available): 6-seater tables
  if (sixSeaterTables.length > 0) {
    currentColumn++;
    let currentY = margin;
    
    for (const shape of sixSeaterTables) {
      // Check if adding this table would cause overflow
      if (currentY + shape.height > maxCanvasHeight - margin) {
        // Move to next column
        currentColumn++;
        currentY = margin;
      }
      
      const table: Table = {
        id: `main-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  return layout;
}

/**
 * Get tables for Terrace Floor
 * Large tables (>6) are placed first, then small tables below them in the same column
 */
export function getTerraceFloorTables(): Table[] {
  const layout: Array<Table> = [];
  const margin = 100;
  const horizontalGap = 280;
  const verticalGap = 60;
  const maxCanvasHeight = 4000;

  const tableShapes: Array<{ width: number; height: number; seats: number; shape: Table['shape'] }> = [
    { width: 120, height: 127, seats: 2, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
    { width: 126, height: 283, seats: 6, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
    { width: 150, height: 480, seats: 12, shape: 'rectangular' },
    { width: 126, height: 283, seats: 6, shape: 'rectangular' },
  ];

  const smallTables: typeof tableShapes = [];
  const sixSeaterTables: typeof tableShapes = [];
  const largeTables: typeof tableShapes = [];

  tableShapes.forEach(shape => {
    if (shape.seats === 6) {
      sixSeaterTables.push(shape);
    } else if (shape.seats > 6) {
      largeTables.push(shape);
    } else {
      smallTables.push(shape);
    }
  });

  let tableIndex = 0;
  let currentColumn = 0;

  // Column 1: Large tables first, then small tables below them
  if (largeTables.length > 0 || smallTables.length > 0) {
    let currentY = margin;
    
    for (const shape of largeTables) {
      if (currentY + shape.height > maxCanvasHeight - margin) {
        currentColumn++;
        currentY = margin;
      }
      const table: Table = {
        id: `terrace-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
    
    for (const shape of smallTables) {
      if (currentY + shape.height > maxCanvasHeight - margin) {
        currentColumn++;
        currentY = margin;
      }
      const table: Table = {
        id: `terrace-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  // Column 2: 6-seater tables
  if (sixSeaterTables.length > 0) {
    currentColumn++;
    let currentY = margin;
    for (const shape of sixSeaterTables) {
      if (currentY + shape.height > maxCanvasHeight - margin) {
        currentColumn++;
        currentY = margin;
      }
      const table: Table = {
        id: `terrace-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  return layout;
}

// KitchenItem is now imported from '../core/interfaces/kitchen.interface'
// Re-export for backward compatibility
export type { KitchenItem } from '../core/interfaces/kitchen.interface';

/**
 * Get kitchen items for Kitchen Floor
 * Returns kitchen images positioned on the canvas
 */
export function getKitchenFloorItems(): KitchenItem[] {
  return [
    { id: 'kitchen-1', label: 'Kitchen Station 1', image: 'http://localhost:4201/kitchen_data/IMG_3794.jpg' },
    { id: 'kitchen-2', label: 'Kitchen Station 2', image: 'http://localhost:4201/kitchen_data/IMG_3790.jpg' },
    { id: 'bar', label: 'Bar', image: 'http://localhost:4201/kitchen_data/IMG_3789.jpg' },
    { id: 'seafood', label: 'Seafood', image: 'http://localhost:4201/kitchen_data/IMG_3787.jpg' },
    { id: 'pastry', label: 'Pastry', image: 'http://localhost:4201/kitchen_data/IMG_3786.jpg' },
    { id: 'sushi', label: 'Sushi', image: 'http://localhost:4201/kitchen_data/IMG_3784.jpg' },
    { id: 'grill', label: 'Grill', image: 'http://localhost:4201/kitchen_data/IMG_3782.jpg' },
    { id: 'oven', label: 'Oven', image: 'http://localhost:4201/kitchen_data/IMG_3780.jpg' },
    { id: 'chef', label: 'Chef Station', image: 'http://localhost:4201/kitchen_data/IMG_3778.jpg' },
    { id: 'prep', label: 'Prep Area', image: 'http://localhost:4201/kitchen_data/IMG_3777.jpg' },
    { id: 'dessert', label: 'Desserts', image: 'http://localhost:4201/kitchen_data/IMG_3776.jpg' },
    { id: 'kitchen-3', label: 'Kitchen Station 3', image: 'http://localhost:4201/kitchen_data/IMG_3775.jpg' },
    { id: 'kitchen-4', label: 'Kitchen Station 4', image: 'http://localhost:4201/kitchen_data/IMG_3773.jpg' },
  ];
}

/**
 * Get tables for Kitchen Floor
 * Returns empty array - kitchen floor uses kitchen items instead
 */
export function getKitchenFloorTables(): Table[] {
  return [];
}

/**
 * Get tables for Major Floor
 * Large tables (>6) are distributed across columns to prevent overflow
 * Small tables are placed below large tables in the same column when space allows
 */
export function getMajorFloorTables(): Table[] {
  const layout: Array<Table> = [];
  const margin = 80;
  const horizontalGap = 300;
  const verticalGap = 50;
  const maxCanvasHeight = 1500; // Conservative height to prevent overflow - forces tables to distribute across columns

  const tableShapes: Array<{ width: number; height: number; seats: number; shape: Table['shape'] }> = [
    { width: 126, height: 283, seats: 6, shape: 'rectangular' },
    { width: 150, height: 480, seats: 12, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
    { width: 150, height: 480, seats: 12, shape: 'rectangular' },
    { width: 120, height: 127, seats: 2, shape: 'rectangular' },
    { width: 150, height: 190, seats: 4, shape: 'rectangular' },
  ];

  const smallTables: typeof tableShapes = [];
  const sixSeaterTables: typeof tableShapes = [];
  const largeTables: typeof tableShapes = [];

  tableShapes.forEach(shape => {
    if (shape.seats === 6) {
      sixSeaterTables.push(shape);
    } else if (shape.seats > 6) {
      largeTables.push(shape);
    } else {
      smallTables.push(shape);
    }
  });

  let tableIndex = 0;
  let currentColumn = 0;

  // Column 1: Distribute large tables across columns to prevent overflow
  if (largeTables.length > 0) {
    let currentY = margin;
    
    for (const shape of largeTables) {
      // Check if adding this table would cause overflow
      if (currentY + shape.height + verticalGap > maxCanvasHeight - margin) {
        // Move to next column
        currentColumn++;
        currentY = margin;
      }
      
      const table: Table = {
        id: `major-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      if (tableIndex === tableShapes.length - 1) {
        table.status = 'unsynced';
        table.indicators = { ...(table.indicators ?? {}), paymentRequested: true };
        table.notes = `${table.notes ?? ''} NFC sync pending`.trim();
      }
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
    
    // Place small tables below large tables in the same column if space allows
    for (const shape of smallTables) {
      // Check if adding this table would cause overflow
      if (currentY + shape.height + verticalGap > maxCanvasHeight - margin) {
        // Move to next column
        currentColumn++;
        currentY = margin;
      }
      
      const table: Table = {
        id: `major-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      if (tableIndex === tableShapes.length - 1) {
        table.status = 'unsynced';
        table.indicators = { ...(table.indicators ?? {}), paymentRequested: true };
        table.notes = `${table.notes ?? ''} NFC sync pending`.trim();
      }
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  } else if (smallTables.length > 0) {
    // If no large tables, just place small tables
    let currentY = margin;
    for (const shape of smallTables) {
      if (currentY + shape.height + verticalGap > maxCanvasHeight - margin) {
        currentColumn++;
        currentY = margin;
      }
      const table: Table = {
        id: `major-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      if (tableIndex === tableShapes.length - 1) {
        table.status = 'unsynced';
        table.indicators = { ...(table.indicators ?? {}), paymentRequested: true };
        table.notes = `${table.notes ?? ''} NFC sync pending`.trim();
      }
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  // Next column: 6-seater tables
  if (sixSeaterTables.length > 0) {
    currentColumn++;
    let currentY = margin;
    for (const shape of sixSeaterTables) {
      if (currentY + shape.height + verticalGap > maxCanvasHeight - margin) {
        currentColumn++;
        currentY = margin;
      }
      const table: Table = {
        id: `major-${(tableIndex + 1).toString().padStart(2, '0')}`,
        label: `T${(tableIndex + 1).toString().padStart(2, '0')}`,
        status: 'free',
        width: shape.width,
        height: shape.height,
        seats: shape.seats,
        shape: shape.shape,
        x: margin + currentColumn * horizontalGap,
        y: currentY,
      };
      applyTableMetadata(table, tableIndex);
      if (tableIndex === tableShapes.length - 1) {
        table.status = 'unsynced';
        table.indicators = { ...(table.indicators ?? {}), paymentRequested: true };
        table.notes = `${table.notes ?? ''} NFC sync pending`.trim();
      }
      layout.push(table);
      currentY += shape.height + verticalGap;
      tableIndex++;
    }
  }

  return layout;
}

/**
 * Get tables for a specific floor
 */
export function getFloorTables(floor: FloorType): Table[] {
  let tables: Table[] = [];
  switch (floor) {
    case 'main':
      tables = getMainFloorTables();
      break;
    case 'terrace':
      tables = getTerraceFloorTables();
      break;
    case 'kitchen':
      tables = getKitchenFloorTables();
      break;
    case 'major':
      tables = getMajorFloorTables();
      break;
    default:
      tables = [];
  }

  // Limit to 5 tables for main, terrace and major
  if (floor === 'main' || floor === 'terrace' || floor === 'major') {
    return tables.slice(0, 6);
  }
  return tables;
}

