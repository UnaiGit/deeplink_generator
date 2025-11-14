/**
 * Icon Constants
 * 
 * Centralized location for all icon paths.
 * Change icons here to update them everywhere in the application.
 * 
 * All icons are located in: public/icons/
 */

// Get the base URL dynamically based on the current origin (port)
const getBaseUrl = (): string => {
  console.log("this is the window", window.location , document.location);
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or non-browser environments
  return 'http://localhost:4201';
};

const BASE_URL = getBaseUrl();

export const ICON_PATHS = {
  // Notification & Alert Icons
  bell: `${BASE_URL}/icons/bell.svg`,

  // Time & Clock Icons
  clock: `${BASE_URL}/icons/clock.svg`,

  // Payment Icons
  card: `${BASE_URL}/icons/card.svg`,

  // Action Icons
  build: `${BASE_URL}/icons/build.svg`,
  employees: `${BASE_URL}/icons/employees.svg`,
  floors: `${BASE_URL}/icons/floors.svg`,
  reservations: `${BASE_URL}/icons/reservations.svg`,

  // Stats Icons
  chart: `${BASE_URL}/icons/chart.svg`,
  checkmark: `${BASE_URL}/icons/checkmark.svg`,

  // Notification Icons
  calendar: `${BASE_URL}/icons/calender.svg`,
  chef: `${BASE_URL}/icons/chef_cap.svg`,
  money: `${BASE_URL}/icons/payment.svg`,
  refresh: `${BASE_URL}/icons/refresh.svg`,

  // Table Status Icons
  lock: `${BASE_URL}/icons/lock.svg`,
  antenna: `${BASE_URL}/icons/antenna.svg`,
  time: `${BASE_URL}/icons/time.svg`,

  // Builder Bar Icons
  builderBar: `${BASE_URL}/builder_bar/builderIcon.svg`,
  builderEmployee: `${BASE_URL}/builder_bar/builderbarEmployee.svg`,
  builderFloor: `${BASE_URL}/builder_bar/floorLayer.svg`,

  // Department Icons
  departmentsManager: `${BASE_URL}/builder_bar/manager.svg`,
  departmentsStockroom: `${BASE_URL}/builder_bar/stockroom.svg`,
  departmentsMarketing: `${BASE_URL}/builder_bar/markeeting.svg`,
  departmentsTable: `${BASE_URL}/builder_bar/table.svg`,
  departmentsHR: `${BASE_URL}/builder_bar/manager.svg`,
  departmentsReception: `${BASE_URL}/builder_bar/departments.svg`,
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

