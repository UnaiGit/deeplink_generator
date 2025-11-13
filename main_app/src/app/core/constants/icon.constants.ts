/**
 * Icon Constants
 * 
 * Centralized location for all icon paths.
 * Change icons here to update them everywhere in the application.
 * 
 * All icons are located in: public/icons/
 */

export const ICON_PATHS = {
  // Navigation & Menu Icons
  dashboard: 'http://localhost:4200/icons/dashboard.svg',
  menu: 'http://localhost:4200/icons/menu.svg',
  toggle: 'http://localhost:4200/icons/toggle.svg',
  categorey: 'http://localhost:4200/icons/categorey.svg',
  caticon: 'http://localhost:4200/icons/caticon.svg',
  
  // Feature Icons
  analytics: 'http://localhost:4200/icons/analytics.svg',
  market: 'http://localhost:4200/icons/market.svg',
  feedback: 'http://localhost:4200/icons/feedback.svg',
  reservation: 'http://localhost:4200/icons/reservation.svg',
  occupation: 'http://localhost:4200/icons/occupation.svg',
  dishes: 'http://localhost:4200/icons/dishes.svg',
  
  // Department & Kitchen Icons
  chefhat: 'http://localhost:4200/icons/chefhat.svg',
  bar: 'http://localhost:4200/icons/bar.svg',
  donut: 'http://localhost:4200/icons/donut.svg',
  cooking: 'http://localhost:4200/icons/cooking.svg',
  dish: 'http://localhost:4200/icons/dish.svg',
  tea: 'http://localhost:4200/icons/tea.svg',
  teacup: 'http://localhost:4200/icons/teacup.svg',
  
  // Status & Action Icons
  bell: 'http://localhost:4200/icons/bell.svg',
  delete: 'http://localhost:4200/icons/delete.svg',
  pen: 'http://localhost:4200/icons/pen.svg',
  refresh: 'http://localhost:4200/icons/refresh.svg',
  ready: 'http://localhost:4200/icons/ready.svg',
  danger: 'http://localhost:4200/icons/danger.svg',
  like: 'http://localhost:4200/icons/like.svg',
  
  // UI Icons
  arrow: 'http://localhost:4200/icons/arrow.svg',
  forward: 'http://localhost:4200/icons/forward.svg',
  chevronDown: 'http://localhost:4200/icons/chevron-down.svg',
  search: 'http://localhost:4200/icons/search.png',
  fullscreen: 'http://localhost:4200/icons/fullscreen.png',
  
  // Communication Icons
  call: 'http://localhost:4200/icons/call.svg',
  chat: 'http://localhost:4200/icons/chat.svg',
  
  // Data & Stats Icons
  graph: 'http://localhost:4200/icons/graph.svg',
  history: 'http://localhost:4200/icons/history.svg',
  history2: 'http://localhost:4200/icons/history2.svg',
  
  // Order & Business Icons
  ordericon: 'http://localhost:4200/icons/ordericon.png',
  conecticon: 'http://localhost:4200/icons/conecticon.png',
  dollar: 'http://localhost:4200/icons/dollar.png',
  tableicon: 'http://localhost:4200/icons/tableicon.svg',
  
  // Food Category Icons
  foods: 'http://localhost:4200/icons/foods.png',
  drinks: 'http://localhost:4200/icons/drinks.png',
  deserts: 'http://localhost:4200/icons/deserts.png',
  
  // Utility Icons
  tuning: 'http://localhost:4200/icons/tuning.svg',
  command: 'http://localhost:4200/icons/command.png',
  K: 'http://localhost:4200/icons/K.png',
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

