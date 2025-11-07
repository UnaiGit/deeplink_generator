/**
 * Notification Constants
 * 
 * This file contains all notification-related constants including type configurations,
 * colors, icons, and styling values.
 * 
 * To change notification appearance globally, modify the values in NOTIFICATION_CONFIG.
 */

import { NotificationType, NotificationConfig } from '../../components/notifications/notification.model';
import { ICON_PATHS } from './icon.constants';

export const NOTIFICATION_CONSTANTS = {
  // Notification Type Configuration
  // Change colors/icons here to update all notifications across the app
  TYPE_CONFIG: {
    reserved: {
      backgroundColor: '#2D71F71A',
      icon: ICON_PATHS.calendar,
      iconColor: '#1e293b'
    },
    kitchen: {
      backgroundColor: '#FFBE4C1A',
      icon: ICON_PATHS.chef,
      iconColor: '#1e293b'
    },
    payment: {
      backgroundColor: '#B700FF1A',
      icon: ICON_PATHS.money,
      iconColor: '#1e293b'
    },
    general: {
      backgroundColor: '#f1f5f9',
      icon: ICON_PATHS.bell,
      iconColor: '#1e293b'
    }
  } as Record<NotificationType, NotificationConfig>,

  // Mute Button Configuration
  MUTE_BUTTON: {
    BACKGROUND: '#f9a8d4',
    BORDER: '#f9a8d4',
    BACKGROUND_HOVER: '#DF1C411A',
    BORDER_HOVER: '#f472b6',
    TEXT_COLOR: '#B21634',
    BORDER_RADIUS: '14px',
  },
} as const;

