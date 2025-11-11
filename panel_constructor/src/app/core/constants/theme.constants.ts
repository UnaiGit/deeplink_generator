/**
 * Theme Constants
 * 
 * This file contains all theme-related color definitions.
 * These colors are used by ThemeService to apply themes.
 * 
 * To change colors globally, modify the values in the _lightThemeColors and _darkThemeColors objects.
 */

export const THEME_CONSTANTS = {
  // Theme Storage Key
  STORAGE_KEY: 'app-theme',
  
  // Default Theme
  DEFAULT_THEME: 'light' as const,

  // Supported Themes
  SUPPORTED_THEMES: ['light', 'dark'] as const,

  // Light Theme Colors
  LIGHT_THEME: {
    // Primary theme colors
    '--orange': '#E9380B',
    '--blue': '#3b82f6', // Primary blue for active states
    '--yellow': '#FBC52D',
    '--dark-charcoal': '#333843',
    '--deep-gray': '#393B3D',
    '--slate-gray': '#667085',
    '--surface-1': '#FAFAFA',
    '--text-color-light': '#ffffff',
    '--text-color-medium': '#667085',
    '--text-color-dark': '#333843',
    '--sidebar-bg': '#ffffff',
    '--header-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--border-color': '#eef2f7',
    '--search-bg': '#f8fafc',
    '--input-bg': '#ffffff',
    '--shadow-color': 'rgba(15, 23, 42, 0.04)',
    '--icon-filter': 'none',
    // Grayscale
    '--white': '#fff',
    '--gray': '#e1e3e6',
    '--gray-100': '#f8f9fa',
    '--gray-150': '#f1f3f4',
    '--gray-200': '#e9ecef',
    '--gray-300': '#dee2e6',
    '--gray-400': '#ced4da',
    '--gray-500': '#adb5bd',
    '--gray-600': '#868e96',
    '--gray-700': '#495057',
    '--gray-800': '#343a40',
    '--gray-900': '#212529',
    '--black': '#000',
    '--minor-gray': '#f2f2f5',
    // Panel constructor specific colors
    '--canvas-bg': '#f9fafb',
    '--floor-area-bg': '#f9fafc',
    '--notification-bg': '#ffffff',
    '--notification-title': '#111827',
    '--notification-message': '#6b7280',
    '--floor-info-bg': '#f9fafb',
    '--floor-info-border': '#e5e7eb',
    // Chair colors
    '--chair-available-fill': '#e5e7eb',
    '--chair-available-border': '#d1d5db',
    '--chair-occupied-fill': '#ef4444',
    '--chair-occupied-border': '#dc2626',
  },

  // Dark Theme Colors
  DARK_THEME: {
    // Adjusted primary theme colors for dark theme
    '--orange': '#ff6b35',
    '--blue': '#60a5fa', // Lighter blue for dark theme active states
    '--yellow': '#ffd23f',
    '--dark-charcoal': '#e0e0e0',
    '--deep-gray': '#b0b0b0',
    '--slate-gray': '#9ca3af',
    '--surface-1': '#111827',
    '--text-color-light': '#1f2937',
    '--text-color-medium': '#9ca3af',
    '--text-color-dark': '#f3f4f6',
    '--sidebar-bg': '#1f2937',
    '--header-bg': '#1f2937',
    '--card-bg': '#1f2937',
    '--border-color': '#374151',
    '--search-bg': '#374151',
    '--input-bg': '#374151',
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--icon-filter': 'brightness(0) invert(1)',
    // Inverted Grayscale for Dark Theme
    '--white': '#1f2937',
    '--gray': '#4b5563',
    '--gray-100': '#374151',
    '--gray-150': '#2d3748',
    '--gray-200': '#4b5563',
    '--gray-300': '#6b7280',
    '--gray-400': '#9ca3af',
    '--gray-500': '#d1d5db',
    '--gray-600': '#e5e7eb',
    '--gray-700': '#f3f4f6',
    '--gray-800': '#f9fafb',
    '--gray-900': '#ffffff',
    '--black': '#f9fafb',
    '--minor-gray': '#374151',
    // Panel constructor specific colors for dark theme
    '--canvas-bg': '#1f2937',
    '--floor-area-bg': '#111827',
    '--notification-bg': '#1f2937',
    '--notification-title': '#f3f4f6',
    '--notification-message': '#9ca3af',
    '--floor-info-bg': '#1f2937',
    '--floor-info-border': '#374151',
    // Chair colors for dark theme
    '--chair-available-fill': '#9ca3af',
    '--chair-available-border': '#d1d5db',
    '--chair-occupied-fill': '#ef4444',
    '--chair-occupied-border': '#dc2626',
  },
} as const;

