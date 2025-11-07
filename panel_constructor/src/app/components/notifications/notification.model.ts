import { NOTIFICATION_CONSTANTS } from '../../core/constants/notification.constants';

export type NotificationType = 'reserved' | 'kitchen' | 'payment' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string; // Optional - will use translation if not provided
  message?: string; // Optional - will use translation if not provided
  icon?: string;
  timestamp?: Date;
}

export interface NotificationConfig {
  backgroundColor: string;
  icon: string;
  iconColor: string;
}

// Use centralized constants - change values in NOTIFICATION_CONSTANTS.TYPE_CONFIG
export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = NOTIFICATION_CONSTANTS.TYPE_CONFIG;

