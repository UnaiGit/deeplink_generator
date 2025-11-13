/**
 * Table Constants
 * 
 * This file contains all table-related constants including status configurations,
 * colors, icons, and styling values.
 * 
 * To change table appearance globally, modify the values in TABLE_STATUS_CONFIG.
 */

import { TableStatus, TableStatusConfig } from '../../utils/table.model';
import { ICON_PATHS } from './icon.constants';

export const TABLE_CONSTANTS = {
  // Table Status Configuration
  // Change colors/icons here to update all tables across the app
  STATUS_CONFIG: {
    free: {
      color: '#166534',
      backgroundColor: '#40C4AA', // Teal - Available (matching Figma)
      borderColor: '#16a34a',
      label: 'Available',
      icon: ICON_PATHS.floors
    },
    booked: {
      color: '#1d4ed8',
      backgroundColor: '#3b82f6', // Blue - Reserved
      borderColor: '#2563eb',
      label: 'Reserved',
      icon: ICON_PATHS.calendar
    },
    noShow: {
      color: '#92400e',
      backgroundColor: '#fbbf24', // Yellow - No order
      borderColor: '#f59e0b',
      label: 'No order',
      icon: ICON_PATHS.refresh
    },
    occupied: {
      color: '#b91c1c',
      backgroundColor: '#ef4444', // Red - Occupied
      borderColor: '#dc2626',
      label: 'Occupied',
      icon: ICON_PATHS.chef
    },
    pendingPayment: {
      color: '#a21caf',
      backgroundColor: '#d946ef', // Magenta/Purple - Payment
      borderColor: '#c026d3',
      label: 'Payment',
      icon: ICON_PATHS.card
    },
    overstay: {
      color: '#b91c1c',
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      label: 'Overstay',
      icon: ICON_PATHS.refresh // Warning icon for overstay
    },
    unsynced: {
      color: '#374151',
      backgroundColor: '#94a3b8',
      borderColor: '#64748b',
      label: 'Sync Needed',
      icon: ICON_PATHS.antenna
    }
  } as Record<TableStatus, TableStatusConfig>,

  // Table Shape Types
  SHAPES: {
    RECTANGULAR: 'rectangular',
    ROUND: 'round',
    SQUARE: 'square',
  } as const,

  // Canvas Drawing Defaults
  CANVAS_DEFAULTS: {
    TABLE_FILL_COLOR_LIGHT: '#e5e7eb',
    TABLE_STROKE_COLOR_LIGHT: '#d1d5db',
    TABLE_FILL_COLOR_DARK: '#6b7280',
    TABLE_STROKE_COLOR_DARK: '#9ca3af',
    STATUS_PILL_TEXT_COLOR: '#ffffff',
    TABLE_ICON_COLOR: '#ffffff',
  },

  // Table Counts per Floor (for display purposes)
  FLOOR_TABLE_COUNTS: {
    main: 6,
    terrace: 6,
    kitchen: 6,
    major: 6,
  } as const,
} as const;

