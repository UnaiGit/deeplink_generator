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
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or non-browser environments
  return 'http://localhost:4200';
};

const BASE_URL = getBaseUrl();

export const ICON_PATHS = {
  // Navigation & Menu Icons
  dashboard: `${BASE_URL}/icons/dashboard.svg`,
  menu: `${BASE_URL}/icons/menu.svg`,
  toggle: `${BASE_URL}/icons/toggle.svg`,
  categorey: `${BASE_URL}/icons/categorey.svg`,
  caticon: `${BASE_URL}/icons/caticon.svg`,

  // Feature Icons
  analytics: `${BASE_URL}/icons/analytics.svg`,
  market: `${BASE_URL}/icons/market.svg`,
  feedback: `${BASE_URL}/icons/feedback.svg`,
  reservation: `${BASE_URL}/icons/reservation.svg`,
  occupation: `${BASE_URL}/icons/occupation.svg`,
  dishes: `${BASE_URL}/icons/dishes.svg`,

  // Department & Kitchen Icons
  chefhat: `${BASE_URL}/icons/chefhat.svg`,
  bar: `${BASE_URL}/icons/bar.svg`,
  donut: `${BASE_URL}/icons/donut.svg`,
  cooking: `${BASE_URL}/icons/cooking.svg`,
  dish: `${BASE_URL}/icons/dish.svg`,
  tea: `${BASE_URL}/icons/tea.svg`,
  teacup: `${BASE_URL}/icons/teacup.svg`,

  // Status & Action Icons
  bell: `${BASE_URL}/icons/bell.svg`,
  delete: `${BASE_URL}/icons/delete.svg`,
  pen: `${BASE_URL}/icons/pen.svg`,
  refresh: `${BASE_URL}/icons/refresh.svg`,
  ready: `${BASE_URL}/icons/ready.svg`,
  danger: `${BASE_URL}/icons/danger.svg`,
  like: `${BASE_URL}/icons/like.svg`,

  // UI Icons
  arrow: `${BASE_URL}/icons/arrow.svg`,
  forward: `${BASE_URL}/icons/forward.svg`,
  chevronDown: `${BASE_URL}/icons/chevron-down.svg`,
  search: `${BASE_URL}/icons/search.png`,
  fullscreen: `${BASE_URL}/icons/fullscreen.png`,

  // Communication Icons
  call: `${BASE_URL}/icons/call.svg`,
  chat: `${BASE_URL}/icons/chat.svg`,

  // Data & Stats Icons
  graph: `${BASE_URL}/icons/graph.svg`,
  history: `${BASE_URL}/icons/history.svg`,
  history2: `${BASE_URL}/icons/history2.svg`,

  // Order & Business Icons
  ordericon: `${BASE_URL}/icons/ordericon.png`,
  conecticon: `${BASE_URL}/icons/conecticon.png`,
  dollar: `${BASE_URL}/icons/dollar.png`,
  tableicon: `${BASE_URL}/icons/tableicon.svg`,

  // Food Category Icons
  foods: `${BASE_URL}/icons/foods.png`,
  drinks: `${BASE_URL}/icons/drinks.png`,
  deserts: `${BASE_URL}/icons/deserts.png`,

  // Utility Icons
  tuning: `${BASE_URL}/icons/tuning.svg`,
  command: `${BASE_URL}/icons/command.png`,
  K: `${BASE_URL}/icons/K.png`,
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

