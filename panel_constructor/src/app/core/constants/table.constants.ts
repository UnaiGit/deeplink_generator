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
    available: {
      color: '#065f46',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      icon: ICON_PATHS.bell
    },
    occupied: {
      color: '#991b1b',
      backgroundColor: '#ef4444',
      borderColor: '#ef4444',
      icon: ICON_PATHS.time
    },
    reserved: {
      color: '#1e3a8a',
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      icon: ICON_PATHS.lock
    },
    payment: {
      color: '#9a3412',
      backgroundColor: '#f97316',
      borderColor: '#f97316',
      icon: ICON_PATHS.card
    },
    unsynced: {
      color: '#374151',
      backgroundColor: '#6b7280',
      borderColor: '#6b7280',
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
    main: 10,
    terrace: 6,
    kitchen: 3,
    major: 8,
  } as const,
} as const;

