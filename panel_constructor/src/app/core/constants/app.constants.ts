/**
 * Application-wide constants
 * 
 * This file contains all app-level constants like dimensions, spacing, z-index values, etc.
 * Change values here to update the entire application.
 */

export const APP_CONSTANTS = {
  // Layout & Spacing
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
    XXL: '24px',
    XXXL: '32px',
  },

  // Border Radius
  BORDER_RADIUS: {
    SM: '6px',
    MD: '12px',
    LG: '14px',
    XL: '16px',
  },

  // Z-Index Layers
  Z_INDEX: {
    BASE: 0,
    STICKY_HEADER: 50,
    NOTIFICATIONS: 100,
    MODAL: 1000,
  },

  // Canvas Configuration
  CANVAS: {
    TABLE_BORDER_RADIUS: 36,
    TABLE_SQUARE_BORDER_RADIUS: 28,
    STATUS_PILL_RADIUS: 11,
    STATUS_PILL_HEIGHT: 22,
    STATUS_PILL_OFFSET_X: 8,
    STATUS_PILL_OFFSET_Y: -14,
    STATUS_PILL_MIN_WIDTH: 48,
  },

  // Typography
  FONT_SIZE: {
    XS: '11px',
    SM: '13px',
    MD: '14px',
    LG: '16px',
    XL: '18px',
    XXL: '24px',
  },

  FONT_WEIGHT: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },

  // Animation & Transitions
  TRANSITION: {
    FAST: '0.15s',
    NORMAL: '0.2s',
    SLOW: '0.3s',
  },

  // Component Dimensions
  DIMENSIONS: {
    FLOOR_TAB_HEIGHT: 57,
    STATUS_LEGEND_HEIGHT: 49,
    NOTIFICATION_MIN_WIDTH: 320,
    NOTIFICATION_MAX_WIDTH: 400,
    FLOOR_INFO_MIN_WIDTH: 280,
  },

  // Polling & Sync
  SYNC: {
    THEME_POLL_INTERVAL: 500, // milliseconds
    LANGUAGE_POLL_INTERVAL: 500, // milliseconds
  },
} as const;

