/**
 * Icon Constants
 * 
 * Centralized location for all icon paths.
 * Change icons here to update them everywhere in the application.
 * 
 * All icons are located in: public/icons/
 */

export const ICON_PATHS = {
  // Notification & Alert Icons
  bell: '/icons/bell.svg',
  
  // Time & Clock Icons
  clock: '/icons/clock.svg',
  
  // Payment Icons
  card: '/icons/card.svg',
  
  // Action Icons
  build: '/icons/build.svg',
  employees: '/icons/employees.svg',
  floors: '/icons/floors.svg',
  reservations: '/icons/reservations.svg',
  
  // Stats Icons
  chart: '/icons/chart.svg',
  checkmark: '/icons/checkmark.svg',
  
  // Notification Icons
  calendar: '/icons/calendar.svg',
  chef: '/icons/chef.svg',
  money: '/icons/money.svg',
  refresh: '/icons/refresh.svg',
  
  // Table Status Icons
  lock: '/icons/lock.svg',
  antenna: '/icons/antenna.svg',
  time: '/icons/time.svg',
} as const;

/**
 * Icon type for type safety
 */
export type IconType = keyof typeof ICON_PATHS;

/**
 * Get icon path by key
 */
export function getIconPath(icon: IconType): string {
  return ICON_PATHS[icon];
}

