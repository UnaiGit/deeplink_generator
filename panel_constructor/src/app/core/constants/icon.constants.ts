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
  bell: 'http://localhost:4201/icons/bell.svg',
  
  // Time & Clock Icons
  clock: 'http://localhost:4201/icons/clock.svg',
  
  // Payment Icons
  card: 'http://localhost:4201/icons/card.svg',
  
  // Action Icons
  build: 'http://localhost:4201/icons/build.svg',
  employees: 'http://localhost:4201/icons/employees.svg',
  floors: 'http://localhost:4201/icons/floors.svg',
  reservations: 'http://localhost:4201/icons/reservations.svg',
  
  // Stats Icons
  chart: 'http://localhost:4201/icons/chart.svg',
  checkmark: 'http://localhost:4201/icons/checkmark.svg',
  
  // Notification Icons
  calendar: 'http://localhost:4201/icons/calender.svg',
  chef: 'http://localhost:4201/icons/chef_cap.svg',
  money: 'http://localhost:4201/icons/payment.svg',
  refresh: 'http://localhost:4201/icons/refresh.svg',
  
  // Table Status Icons
  lock: 'http://localhost:4201/icons/lock.svg',
  antenna: 'http://localhost:4201/icons/antenna.svg',
  time: 'http://localhost:4201/icons/time.svg',

  // Builder Bar Icons
  builderBar: 'http://localhost:4201/builder_bar/builderIcon.svg',
  builderEmployee: 'http://localhost:4201/builder_bar/builderbarEmployee.svg',
  builderFloor: 'http://localhost:4201/builder_bar/floorLayer.svg',

  // Department Icons
  departmentsManager: 'http://localhost:4201/builder_bar/manager.svg',
  departmentsStockroom: 'http://localhost:4201/builder_bar/stockroom.svg',
  departmentsMarketing: 'http://localhost:4201/builder_bar/markeeting.svg',
  departmentsTable: 'http://localhost:4201/builder_bar/table.svg',
  departmentsHR: 'http://localhost:4201/builder_bar/manager.svg',
  departmentsReception: 'http://localhost:4201/builder_bar/departments.svg',
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

